package com.example.demo;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;

public interface TextRepository extends JpaRepository<Text, Long> {
    Optional<Text> findByCode(String code);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM text WHERE created_at < :expiryLimit", nativeQuery = true)
    void deleteOldEntries(LocalDateTime expiryLimit);

}
