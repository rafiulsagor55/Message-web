package com.example.demo;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;

public interface VerificationRepository extends JpaRepository<verifyEmail, Long> {
    Optional<verifyEmail> findByEmailAndCode(String email, String code);
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM verify_email WHERE email = :email", nativeQuery = true)
      void deleteAllByEmail(@Param("email") String email);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM verify_email WHERE expiry_time < :expiryLimit", nativeQuery = true)
    void deleteExpiredEntries(@Param("expiryLimit") LocalDateTime expiryLimit);

}