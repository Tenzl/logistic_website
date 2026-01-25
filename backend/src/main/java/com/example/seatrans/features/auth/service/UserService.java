package com.example.seatrans.features.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleValidationService roleValidationService;

    /**
     * Create a user with default validation.
     */
    public User createUser(User user) {
        validateEmail(user.getEmail());

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new DuplicateUserException("Email", user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Validate role nếu có
        if (user.getRole() != null) {
            roleValidationService.validateUserRole(user);
        }

        return userRepository.save(user);
    }

    /**
     * Register external user or upgrade guest account to customer.
     * - If email matches a guest, upgrade profile/password/roles.
     * - If email already used by a non-guest, raise duplicate error.
     * - New users get ROLE_CUSTOMER.
     */
    public User registerOrUpgradeCustomer(RegisterDTO dto) {
        validateEmail(dto.getEmail());
        Optional<User> existingByEmail = userRepository.findByEmail(dto.getEmail());

        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));

        if (existingByEmail.isPresent()) {
            User existing = existingByEmail.get();
                boolean isGuest = existing.getRole() != null && "ROLE_GUEST".equals(existing.getRole().getName());

            if (!isGuest) {
                throw new DuplicateUserException("Email", dto.getEmail());
            }

            existing.setFullName(dto.getFullName());
            existing.setEmail(dto.getEmail());
            existing.setPhone(dto.getPhone());
            existing.setCompany(dto.getCompany());
            existing.setPassword(passwordEncoder.encode(dto.getPassword()));
            existing.setRole(customerRole);
            return userRepository.save(existing);
        }

        // Fresh customer registration
        User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setCompany(dto.getCompany());
        user.setRole(customerRole);
        return userRepository.save(user);
    }

    /**
     * Create a guest user for public inquiry submission or reuse an existing guest.
     * - If email belongs to a registered (non-guest) user: throw DuplicateUserException.
     * - If email belongs to a guest: reuse and lightly refresh profile data.
     * - If email is new: create a guest with a generated password.
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
        guest.setEmail(email);
        guest.setFullName(fullName);
        guest.setPhone(phone);
        guest.setCompany(company);
        guest.setPassword(passwordEncoder.encode("guest-" + UUID.randomUUID()));
        guest.setRole(guestRole);
        return userRepository.save(guest);
    }
    
    /**
     * Táº¡o user vá»›i role
     * 
     * @param user User entity
     * @param roleName role name (VD: "ROLE_ADMIN", "ROLE_EMPLOYEE")
     * @return User Ä‘Ã£ lÆ°u
     */
    public User createUserWithRole(User user, String roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RoleNotFoundException("name", roleName));

        roleValidationService.validateRoleAssignment(user, role);
        user.setRole(role);

        return createUser(user);
    }
    
    // ==================== Read Operations ====================
    
    /**
     * Lấy user theo ID
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    /**
     * Lấy user theo email
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
        return userRepository.searchByEmailOrFullName(keyword);
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
        user.setRole(role);
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
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random secure password
        newUser.setIsActive(true);
        newUser.setEmailVerified(true); // OAuth emails are verified by provider
        newUser.setOauthProvider(provider); // "google"
        newUser.setOauthProviderId(providerId); // Google user ID (sub)
        
        // Assign ROLE_CUSTOMER
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));
        newUser.setRole(customerRole);
        
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


