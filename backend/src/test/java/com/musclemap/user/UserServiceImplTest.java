package com.musclemap.user;

import com.musclemap.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for {@link UserServiceImpl}. No database required (repository mocked). */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void register_hashesPasswordAndNormalizesEmail() {
        when(userRepository.existsByEmailIgnoreCase("ada@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret")).thenReturn("HASHED");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.register("  Ada@Example.com ", "secret", "Ada", Role.COACH);

        assertThat(created.getEmail()).isEqualTo("ada@example.com");
        assertThat(created.getPasswordHash()).isEqualTo("HASHED");
        assertThat(created.getRole()).isEqualTo(Role.COACH);
        assertThat(created.getDisplayName()).isEqualTo("Ada");
        verify(passwordEncoder).encode("secret");
    }

    @Test
    void register_defaultsRoleToUserWhenNull() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("HASHED");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.register("user@example.com", "pw", null, null);

        assertThat(created.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void register_rejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("dup@example.com", "pw", "Dup", Role.USER))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_rejectsBlankEmail() {
        assertThatThrownBy(() -> userService.register("  ", "pw", "X", Role.USER))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getById_throwsWhenMissing() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findOrCreateOAuthUser_createsGoogleUserWithoutPassword() {
        when(userRepository.findByEmailIgnoreCase("ada@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User created = userService.findOrCreateOAuthUser(
                "  Ada@Gmail.com ", "Ada", "https://pic", AuthProvider.GOOGLE);

        assertThat(created.getEmail()).isEqualTo("ada@gmail.com");
        assertThat(created.getPasswordHash()).isNull();
        assertThat(created.getAuthProvider()).isEqualTo(AuthProvider.GOOGLE);
        assertThat(created.getAvatarUrl()).isEqualTo("https://pic");
        assertThat(created.isEmailVerified()).isTrue();
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void findOrCreateOAuthUser_returnsExistingUserAndRefreshesAvatar() {
        User existing = new User();
        existing.setEmail("ada@gmail.com");
        existing.setAuthProvider(AuthProvider.GOOGLE);
        when(userRepository.findByEmailIgnoreCase("ada@gmail.com")).thenReturn(Optional.of(existing));

        User result = userService.findOrCreateOAuthUser(
                "ada@gmail.com", "Ada", "https://new-pic", AuthProvider.GOOGLE);

        assertThat(result).isSameAs(existing);
        assertThat(result.getAvatarUrl()).isEqualTo("https://new-pic");
        verify(userRepository, never()).save(any());
    }
}
