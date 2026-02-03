package com.example.seatrans.features.auth.service;

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
import com.example.seatrans.features.auth.repository.RoleRepository;
import com.example.seatrans.features.auth.repository.UserRepository;
import com.example.seatrans.shared.exception.DuplicateUserException;
import com.example.seatrans.shared.exception.RoleGroupConflictException;
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

        User user = new User(dto.getEmail(), passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setCompany(dto.getCompany());
        user.setRole(customerRole);
        return userRepository.save(user);
    }

    // ==================== Read Operations ====================

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("email", email));
    }
    
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    // ==================== Update Operations ====================

    public User updateUser(Long userId, User updatedUser) {
        User existingUser = getUserById(userId);
        
        if (updatedUser.getFullName() != null) {
            existingUser.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getCompany() != null) {
            existingUser.setCompany(updatedUser.getCompany());
        }

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new DuplicateUserException("Email", updatedUser.getEmail());
            }
            existingUser.setEmail(updatedUser.getEmail());
        }
        
        return userRepository.save(existingUser);
    }
    
    // ==================== Role Management ====================

    public User assignRole(Long userId, String roleName) {
        User user = getUserById(userId);
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RoleNotFoundException("name", roleName));

        validateRoleAssignment(user, role);
        user.setRole(role);
        return userRepository.save(user);
    }
    
    // ==================== Status Management ====================

    public User activateUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(true);
        return userRepository.save(user);
    }
    
    public User deactivateUser(Long userId) {
        User user = getUserById(userId);
        user.setIsActive(false);
        return userRepository.save(user);
    }
    
    // ==================== Delete Operations ====================

    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }
    
    // ==================== Validation & Check ====================

    private void validateEmail(String email) {
        if (email == null || email.isBlank() || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

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
     * Validate assigning a role to a user for single-role model.
     */
    private void validateRoleAssignment(User user, Role newRole) {
        if (newRole == null || user.getRole() == null) {
            return;
        }

        var currentGroup = user.getRoleGroup();
        var newGroup = newRole.getRoleGroup();

        if (currentGroup != null && newGroup != null && currentGroup != newGroup) {
            throw new RoleGroupConflictException(
                String.format("Cannot switch user from %s to %s without explicit approval.", currentGroup, newGroup)
            );
        }
    }
    
    /**
     * Find or create user from OAuth2 provider (Google)
     */
    public User findOrCreateOAuthUser(String email, String fullName, String provider, String providerId) {
        Optional<User> existingByProvider = userRepository.findByOauthProviderAndOauthProviderId(provider, providerId);
        if (existingByProvider.isPresent()) {
            return existingByProvider.get();
        }
        
        Optional<User> existingByEmail = userRepository.findByEmail(email);
        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            user.setOauthProvider(provider);
            user.setOauthProviderId(providerId);
            user.setEmailVerified(true);
            return userRepository.save(user);
        }
        
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(fullName);
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setIsActive(true);
        newUser.setEmailVerified(true);
        newUser.setOauthProvider(provider);
        newUser.setOauthProviderId(providerId);
        
        Role customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() -> new RoleNotFoundException("name", "ROLE_CUSTOMER"));
        newUser.setRole(customerRole);
        
        return userRepository.save(newUser);
    }
}


