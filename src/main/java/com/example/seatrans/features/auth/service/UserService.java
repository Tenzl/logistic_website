package com.example.seatrans.features.auth.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.seatrans.features.auth.dto.RegisterDTO;
import com.example.seatrans.features.auth.model.Role;
import com.example.seatrans.features.auth.model.User;
import com.example.seatrans.features.auth.model.enums.RoleGroup;
import com.example.seatrans.features.auth.repository.RoleRepository;
import com.example.seatrans.features.auth.repository.UserRepository;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.example.seatrans.shared.exception.RoleNotFoundException;
import com.example.seatrans.shared.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;

/**
 * Service xá»­ lÃ½ business logic cho User
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleValidationService roleValidationService;
    private final PasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN = Pattern
            .compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    // ==================== Create Operations ====================
    
    /**
     * Táº¡o user má»›i
     * 
     * @param user User entity (chÆ°a hash password)
     * @return User Ä‘Ã£ lÆ°u
     */
    public User createUser(User user) {
        // Kiá»ƒm tra duplicate username
        if (user.getUsername() != null && userRepository.existsByUsername(user.getUsername())) {
            throw new DuplicateUserException("Username", user.getUsername());
        }
        
        // Kiá»ƒm tra duplicate email
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateUserException("Email", user.getEmail());
        }
        
        // Hash password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Validate roles náº¿u cÃ³
        if (!user.getRoles().isEmpty()) {
            roleValidationService.validateUserRoles(user);
        }
        
        return userRepository.save(user);
    }

    /**
     * Register external user or upgrade guest account to customer.
     * - If email matches a guest, upgrade username/fullname/password/roles.
     * - If email already used by a non-guest, raise duplicate error.
     * - New users get ROLE_CUSTOMER.
     */
    public User registerOrUpgradeCustomer(RegisterDTO dto) {
        Optional<User> existingByEmail = userRepository.findByEmail(dto.getEmail());

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));

        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
            boolean isGuest = existing.getRoles().stream()
                    .anyMatch(role -> "ROLE_GUEST".equals(role.getName()));

            if (!isGuest) {
                throw new DuplicateUserException("Email", dto.getEmail());
            }

            // When upgrading guest, always check if new username is available
            // Guest's username may be email or null, so check new username isn't taken by someone else
            String existingUsername = existing.getUsername();
            boolean usernameChanging = (existingUsername == null || !existingUsername.equals(dto.getUsername()));
            if (usernameChanging) {
                // Exclude current user from duplicate check
                var userWithUsername = userRepository.findByUsername(dto.getUsername());
                if (userWithUsername.isPresent() && !userWithUsername.get().getId().equals(existing.getId())) {
                    throw new DuplicateUserException("Username", dto.getUsername());
                }
            }

            existing.setUsername(dto.getUsername());
            existing.setFullName(dto.getFullName());
            existing.setEmail(dto.getEmail());
            existing.setPhone(dto.getPhone());
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            // Use mutable set so Hibernate can manage the collection
            existing.setRoles(new HashSet<>(Collections.singleton(customerRole)));
            return userRepository.save(existing);
        }

        // Fresh customer registration
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateUserException("Username", dto.getUsername());
        }

        User user = new User(dto.getUsername(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setRoles(new HashSet<>(Collections.singleton(customerRole)));
        return userRepository.save(user);
    }

    /**
     * Create a guest user for public inquiry submission or reuse an existing guest.
     * - If email belongs to a registered (non-guest) user: throw DuplicateUserException.
     * - If email belongs to a guest: reuse and lightly refresh profile data.
     * - If email is new: create a guest with null username and a generated password.
     */
    public User createOrReuseGuest(String fullName, String email, String phone, String company) {
        validateEmail(email);

        Role guestRole = roleRepository.findByName("ROLE_GUEST")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_GUEST"));

        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            boolean isGuest = user.hasRole("ROLE_GUEST");
            if (!isGuest) {
                throw new DuplicateUserException("Email", email);
            }

            // Refresh lightweight profile fields so the inquiry reflects latest info
            if ((user.getUsername() == null || user.getUsername().isBlank())) {
                user.setUsername(email); // ensure NOT NULL constraint is satisfied
            }
            if (fullName != null && !fullName.isBlank()) {
                user.setFullName(fullName);
            }
            if (phone != null && !phone.isBlank()) {
                user.setPhone(phone);
            }
            if (company != null && !company.isBlank()) {
                user.setCompany(company);
            }
            return userRepository.save(user);
        }

        User guest = new User();
        guest.setUsername(email); // ensure NOT NULL; use email as username for guest
        guest.setEmail(email);
        guest.setFullName(fullName);
        guest.setPhone(phone);
        guest.setCompany(company);
        guest.setPassword(passwordEncoder.encode("guest-" + UUID.randomUUID()));
        guest.setRoles(new HashSet<>(Collections.singleton(guestRole)));
        return userRepository.save(guest);
    }
    
    /**
     * Táº¡o user vá»›i roles
     * 
     * @param user User entity
     * @param roleNames Danh sÃ¡ch role names (VD: "ROLE_ADMIN", "ROLE_EMPLOYEE")
     * @return User Ä‘Ã£ lÆ°u
     */
    public User createUserWithRoles(User user, Set<String> roleNames) {
        // TÃ¬m cÃ¡c roles
        Set<Role> roles = roleNames.stream()
            .map(name -> roleRepository.findByName(name)
                .orElseThrow(() -> new RoleNotFoundException("name", name)))
            .collect(java.util.stream.Collectors.toSet());
        
        // Validate roles compatible
        roleValidationService.validateRoleAssignments(user, roles);
        
        // GÃ¡n roles
        user.setRoles(roles);
        
        return createUser(user);
    }
    
    // ==================== Read Operations ====================
    
    /**
     * Láº¥y user theo ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
    
    /**
     * Láº¥y user theo username
     */
    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("username", username));
    }
    
    /**
     * Láº¥y user theo email
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("email", email));
    }
    
    /**
     * Láº¥y táº¥t cáº£ users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Láº¥y active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    /**
     * Láº¥y users theo role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName);
    }
    
    /**
     * Láº¥y users theo role group
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRoleGroup(RoleGroup roleGroup) {
        return userRepository.findByRoleGroup(roleGroup);
    }
    
    /**
     * TÃ¬m kiáº¿m users
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String keyword) {
        return userRepository.searchByUsernameOrEmail(keyword);
    }
    
    // ==================== Update Operations ====================
    
    /**
     * Cáº­p nháº­t user information
     * KhÃ´ng update password vÃ  roles á»Ÿ Ä‘Ã¢y
     */
    public User updateUser(Long userId, User updatedUser) {
        User existingUser = getUserById(userId);
        
        // Update basic info
        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getCompany() != null) {
            existingUser.setCompany(updatedUser.getCompany());
        }

        
        // Check email duplicate náº¿u thay Ä‘á»•i
        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new DuplicateUserException("Email", updatedUser.getEmail());
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        
        return userRepository.save(existingUser);
    }
    
    /**
     * Äá»•i password
     */
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        
        // Set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    /**
     * Reset password (admin only)
     */
    public void resetPassword(Long userId, String newPassword) {
        User user = getUserById(userId);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    /**
     * Update last login time
     */
    public void updateLastLogin(Long userId) {
        User user = getUserById(userId);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
    
    // ==================== Role Management ====================
    
    /**
     * GÃ¡n role cho user
     */
    public User assignRole(Long userId, String roleName) {
        User user = getUserById(userId);
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RoleNotFoundException("name", roleName));
        
        // Validate role assignment
        roleValidationService.validateRoleAssignment(user, role);
        
        // Kiá»ƒm tra vá»›i user type
        boolean hasCustomer = user.getCustomer() != null;
        boolean hasEmployee = user.getEmployee() != null;
        roleValidationService.validateRoleForUserType(hasCustomer, hasEmployee, role);
        
        user.addRole(role);
        return userRepository.save(user);
    }
    
    /**
     * GÃ¡n nhiá»u roles cho user
     */
    public User assignRoles(Long userId, Set<String> roleNames) {
        User user = getUserById(userId);
        
        Set<Role> roles = roleNames.stream()
            .map(name -> roleRepository.findByName(name)
                .orElseThrow(() -> new RoleNotFoundException("name", name)))
            .collect(java.util.stream.Collectors.toSet());
        
        // Validate role assignments
        roleValidationService.validateRoleAssignments(user, roles);
        
        // Kiá»ƒm tra vá»›i user type
        boolean hasCustomer = user.getCustomer() != null;
        boolean hasEmployee = user.getEmployee() != null;
        for (Role role : roles) {
            roleValidationService.validateRoleForUserType(hasCustomer, hasEmployee, role);
            user.addRole(role);
        }
        
        return userRepository.save(user);
    }
    
    /**
     * XÃ³a role khá»i user
     */
    public User removeRole(Long userId, String roleName) {
        User user = getUserById(userId);
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RoleNotFoundException("name", roleName));
        
        user.removeRole(role);
        return userRepository.save(user);
    }
    
    /**
     * XÃ³a táº¥t cáº£ roles cá»§a user
     */
    public User clearRoles(Long userId) {
        User user = getUserById(userId);
        user.getRoles().clear();
        return userRepository.save(user);
    }
    
    // ==================== Status Management ====================
    
    /**
     * Activate user
     */
    public User activateUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    /**
     * Deactivate user
     */
    public User deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(false);
        return userRepository.save(user);
    }
    
    // ==================== Delete Operations ====================
    
    /**
     * XÃ³a user (hard delete)
     */
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }
    
    // ==================== Validation & Check ====================
    
    /**
     * Kiá»ƒm tra username Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    /**
     * Kiá»ƒm tra email Ä‘Ã£ tá»“n táº¡i chÆ°a
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private void validateEmail(String email) {
        if (email == null || email.isBlank() || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    /**
     * Check if user profile has mandatory identity fields.
     */
    @Transactional(readOnly = true)
    public boolean isProfileComplete(User user) {
        if (user == null) {
            return false;
        }
        return isNotBlank(user.getFullName())
                && isNotBlank(user.getCompany())
                && isNotBlank(user.getEmail())
                && isNotBlank(user.getPhone());
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
    
    /**
     * Kiá»ƒm tra user cÃ³ role khÃ´ng
     */
    @Transactional(readOnly = true)
    public boolean hasRole(Long userId, String roleName) {
        return userRepository.hasRole(userId, roleName);
    }
    
    /**
     * Verify credentials (login)
     * Supports both username and email
     */
    @Transactional(readOnly = true)
    public boolean verifyCredentials(String usernameOrEmail, String password) {
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.getIsActive() && passwordEncoder.matches(password, user.getPassword());
    }

    /**
     * Get user by username or email
     */
    @Transactional(readOnly = true)
    public User getUserByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        return userOpt.orElseThrow(() -> new UserNotFoundException("username or email", usernameOrEmail));
    }
    
    /**
     * Find or create user from OAuth2 provider (Google)
     * Returns existing user if email matches, or creates new OAuth user
     */
    public User findOrCreateOAuthUser(String email, String fullName, String provider, String providerId) {
        // Try to find by OAuth provider ID first (most accurate)
        Optional<User> existingByProvider = userRepository.findByOauthProviderAndOauthProviderId(provider, providerId);
        if (existingByProvider.isPresent()) {
            return existingByProvider.get();
        }
        
        // Try to find by email (for linking existing accounts)
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            // Link OAuth provider to existing account
            user.setOauthProvider(provider);
            user.setOauthProviderId(providerId);
            user.setEmailVerified(true); // OAuth emails are verified
            return userRepository.save(user);
        }
        
        // Create new user from OAuth
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setUsername(email); // Use email as username for OAuth users
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random secure password
        newUser.setIsActive(true);
        newUser.setEmailVerified(true); // OAuth emails are verified by provider
        newUser.setOauthProvider(provider); // "google"
        newUser.setOauthProviderId(providerId); // Google user ID (sub)
        
        // Assign ROLE_CUSTOMER
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));
        newUser.setRoles(new HashSet<>(Collections.singletonList(customerRole)));
        
        return userRepository.save(newUser);
    }
    
    // ==================== Statistics ====================
    
    /**
     * Äáº¿m tá»•ng sá»‘ users
     */
    @Transactional(readOnly = true)
    public Long countTotalUsers() {
        return userRepository.count();
    }
    
    /**
     * Äáº¿m active users
     */
    @Transactional(readOnly = true)
    public Long countActiveUsers() {
        return userRepository.countByIsActiveTrue();
    }
    
    /**
     * Äáº¿m users theo role group
     */
    @Transactional(readOnly = true)
    public Long countUsersByRoleGroup(RoleGroup roleGroup) {
        return userRepository.countByRoleGroup(roleGroup);
    }
}


