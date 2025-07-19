package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface UserRepository extends JpaRepository<User, Long> {
	
	public List<User> findByEmail(String email);
	public List<User> findByEmailAndPassword(String email, String password);
	@Query("SELECT u.imageData AS imageData, u.contentType AS contentType FROM User u WHERE u.email = :email")
	User findImageDataByEmail(String email);
}
