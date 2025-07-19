package com.example.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    @NotBlank(message = "Name must be between 2 and 30 characters!")
    @Size(min = 2, max = 30, message = "Name must be between 2 and 30 characters!")
    private String userName;

    @NotBlank(message = "Password must be at least 4 characters!")
    @Size(min = 4, max = 30, message = "Password must be at least 4 characters!")
    private String password;

    @Lob
    private byte[] imageData;
    
    private String contentType;
}
