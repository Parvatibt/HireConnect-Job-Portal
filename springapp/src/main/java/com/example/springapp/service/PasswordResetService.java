package com.example.springapp.service;

import com.example.springapp.model.PasswordResetToken;
import com.example.springapp.model.User;
import com.example.springapp.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final long expiryMinutes;

    public PasswordResetService(PasswordResetTokenRepository tokenRepo,
                                @Value("${password.reset.token.expiry-minutes:60}") long expiryMinutes) {
        this.tokenRepo = tokenRepo;
        this.expiryMinutes = expiryMinutes;
    }

    @Transactional
    public String createTokenFor(User user) {
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(expiryMinutes * 60L);
        PasswordResetToken prt = new PasswordResetToken(token, user, expiry);
        tokenRepo.save(prt);

        // Note: Email sending has been removed. If you still want to expose the token
        // to the caller (for dev/debug), return it here. In production you should
        // send the token link to the user's email using a mail service.
        return token;
    }

    public Optional<User> validateToken(String token) {
        Optional<PasswordResetToken> opt = tokenRepo.findByToken(token);
        if (opt.isEmpty()) return Optional.empty();
        PasswordResetToken prt = opt.get();
        if (prt.getExpiry().isBefore(Instant.now())) {
            tokenRepo.delete(prt);
            return Optional.empty();
        }
        return Optional.of(prt.getUser());
    }

    public void removeToken(String token) {
        tokenRepo.deleteByToken(token);
    }
}
