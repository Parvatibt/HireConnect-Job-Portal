package com.example.springapp.service;

import com.example.springapp.model.PasswordResetToken;
import com.example.springapp.model.User;
import com.example.springapp.repository.PasswordResetTokenRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;

    public PasswordResetService(PasswordResetTokenRepository tokenRepo) {
        this.tokenRepo = tokenRepo;
    }

    public String createTokenFor(User user) {
        // create token and expiry
        String token = UUID.randomUUID().toString();
        Instant expiry = Instant.now().plusSeconds(60 * 60); // 1 hour
        PasswordResetToken prt = new PasswordResetToken(token, user, expiry);
        tokenRepo.save(prt);
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
