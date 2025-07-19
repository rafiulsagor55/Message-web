package com.example.demo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectedUserRepository extends JpaRepository<ConnectedUser, Long>{
	public List<ConnectedUser>findByUserEmail(String userEmail);
	public List<ConnectedUser> findByFriendEmail(String friendEmail);
	List<ConnectedUser> findByUserEmailAndFriendEmailOrFriendEmailAndUserEmail(String userEmail, String friendEmail, String friendEmail2, String userEmail2);

}
