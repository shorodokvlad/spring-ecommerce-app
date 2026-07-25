package com.shv.Ecommerce.repository;

import com.shv.Ecommerce.entity.EmailVerificationToken;
import com.shv.Ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepo extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByToken(String token);
    void deleteAllByUser(User user);
}
