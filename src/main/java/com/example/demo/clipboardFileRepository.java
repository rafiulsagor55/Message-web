package com.example.demo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.transaction.Transactional;

public interface clipboardFileRepository extends JpaRepository<clipboardFile, Long>{
	List<clipboardFile> findByCode(String code);
	@Query("SELECT c.fileName FROM clipboardFile c WHERE c.code = :code")
    String findFileNameByCode(@Param("code") String code);
	
	    @Modifying
	    @Transactional
	    @Query(value = "DELETE FROM clipboard_file WHERE created_at < :expiryLimit", nativeQuery = true)
	    void deleteOldEntries(LocalDateTime expiryLimit);
}
