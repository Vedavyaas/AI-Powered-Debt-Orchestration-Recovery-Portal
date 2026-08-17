package com.vedavyaas.authentication.model;

public record CreateAccount(String name, String password, Role role, String email, String company) {
}
