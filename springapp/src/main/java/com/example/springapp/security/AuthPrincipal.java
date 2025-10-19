package com.example.springapp.security;

import java.io.Serializable;

/**
 * Lightweight principal wrapper used by JwtAuthenticationFilter to provide a non-null Principal.
 */
public class AuthPrincipal implements java.security.Principal, Serializable {

    private static final long serialVersionUID = 1L;
    private final String name;

    public AuthPrincipal(String name) {
        this.name = name == null ? "" : name;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "AuthPrincipal{" + name + '}';
    }
}
