package com.example.springapp.config;

import com.example.springapp.model.Role;
import com.example.springapp.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoleSeeder {

    @Bean
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName("ROLE_CANDIDATE").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_CANDIDATE"));
            }
            if (roleRepository.findByName("ROLE_RECRUITER").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_RECRUITER"));
            }
            if (roleRepository.findByName("ROLE_ADMIN").isEmpty()) {
                roleRepository.save(new Role(null, "ROLE_ADMIN"));
            }
        };
    }
}
