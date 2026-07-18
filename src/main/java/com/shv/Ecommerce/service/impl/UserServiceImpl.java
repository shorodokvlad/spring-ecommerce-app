package com.shv.Ecommerce.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.shv.Ecommerce.dto.LoginRequest;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.UserDto;
import com.shv.Ecommerce.entity.PasswordResetToken;
import com.shv.Ecommerce.entity.User;
import com.shv.Ecommerce.enums.UserRole;
import com.shv.Ecommerce.exception.InvalidCredentialsException;
import com.shv.Ecommerce.exception.NotFoundException;
import com.shv.Ecommerce.mapper.EntityDtoMapper;
import com.shv.Ecommerce.repository.PasswordResetTokenRepo;
import com.shv.Ecommerce.repository.UserRepo;
import com.shv.Ecommerce.security.JwtUtils;
import com.shv.Ecommerce.service.MailService;
import com.shv.Ecommerce.service.interf.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private static final int RESET_TOKEN_VALIDITY_MINUTES = 15;

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EntityDtoMapper entityDtoMapper;
    private final PasswordResetTokenRepo passwordResetTokenRepo;
    private final MailService mailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.google.client-id}")
    private String googleClientId;
    @Override
    public Response registerUser(UserDto registrationRequest) {
        UserRole role = UserRole.USER;

        /*
        if (registrationRequest.getRole() != null && registrationRequest.getRole().equals("ADMIN")) {
            role = UserRole.ADMIN;
        }
         */
        if (registrationRequest.getRole() != null && registrationRequest.getRole() == UserRole.ADMIN) {
            role = UserRole.ADMIN;
        }
        User user = User.builder()
                .name(registrationRequest.getName())
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phoneNumber(registrationRequest.getPhoneNumber())
                .role(role)
                .build();

        User savedUser = userRepo.save(user);

        UserDto userDto = entityDtoMapper.mapUserToDtoBasic(savedUser);

        return Response.builder()
                .status(200)
                .message("User succsessfuly added")
                .user(userDto)
                .build();
    }

    @Override
    public Response loginRequest(LoginRequest loginRequest) {
        User user = userRepo.findByEmail(loginRequest.getEmail()).orElseThrow(()-> new NotFoundException("Email not found"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Password does not match");
        }
        String token = jwtUtils.generateToken(user);

        return Response.builder()
                .status(200)
                .message("User succsessfully logged in")
                .token(token)
                .expirationTime("6 month")
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public Response forgotPassword(String email) {
        // Always answer the same way so the endpoint can't be used to
        // discover which emails have accounts
        userRepo.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepo.deleteAllByUser(user);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(UUID.randomUUID().toString())
                    .user(user)
                    .expiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALIDITY_MINUTES))
                    .used(false)
                    .build();
            passwordResetTokenRepo.save(resetToken);

            String resetLink = frontendUrl + "/reset-password?token=" + resetToken.getToken();
            mailService.send(
                    user.getEmail(),
                    "Reset your SHV Store password",
                    "Hi " + user.getName() + ",\n\n"
                            + "We received a request to reset your password. "
                            + "Open the link below to choose a new one. "
                            + "It expires in " + RESET_TOKEN_VALIDITY_MINUTES + " minutes.\n\n"
                            + resetLink + "\n\n"
                            + "If you didn't request this, you can ignore this email."
            );
        });

        return Response.builder()
                .status(200)
                .message("If an account exists for that email, a reset link has been sent")
                .build();
    }

    @Override
    @Transactional
    public Response resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepo.findByToken(token)
                .orElseThrow(() -> new InvalidCredentialsException("Reset link is invalid"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("Reset link has expired — request a new one");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepo.save(resetToken);

        return Response.builder()
                .status(200)
                .message("Password updated — you can now log in")
                .build();
    }

    @Override
    @Transactional
    public Response googleLogin(String idTokenString) {
        GoogleIdToken.Payload payload = verifyGoogleIdToken(idTokenString);

        String email = payload.getEmail();
        String name = (String) payload.get("name");

        User user = userRepo.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name != null ? name : email)
                    .email(email)
                    // Google users authenticate via Google; the local password
                    // is an unguessable random value they never use
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .phoneNumber("google-oauth")
                    .role(UserRole.USER)
                    .build();
            log.info("Creating new user from Google sign-in: {}", email);
            return userRepo.save(newUser);
        });

        String token = jwtUtils.generateToken(user);

        return Response.builder()
                .status(200)
                .message("User succsessfully logged in")
                .token(token)
                .expirationTime("6 month")
                .role(user.getRole().name())
                .build();
    }

    private GoogleIdToken.Payload verifyGoogleIdToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier
                    .Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(List.of(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new InvalidCredentialsException("Google sign-in could not be verified");
            }
            return idToken.getPayload();
        } catch (InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            throw new InvalidCredentialsException("Google sign-in could not be verified");
        }
    }

    @Override
    public Response getAllUsers() {
        List<User> users = userRepo.findAll();
        List<UserDto> userDtos = users.stream()
                .map(entityDtoMapper::mapUserToDtoBasic)
                .toList();

        return Response.builder()
                .status(200)
                .message("Succsessful")
                .userList(userDtos)
                .build();
    }

    @Override
    public User getLoginUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("User email is: " + email);

        return userRepo.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));
    }

    @Override
    public Response getUserInfoAndOrderHistory() {
        User user = getLoginUser();
        UserDto userDto = entityDtoMapper.mapUserToDtoPlusAddressAndOrderHistory(user);


        return Response.builder()
                .status(200)
                .user(userDto)
                .build();
    }
}
