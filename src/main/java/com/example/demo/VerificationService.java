package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Random;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class VerificationService {

    @Autowired
    private VerificationRepository verificationRepository;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;

    public String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(999999));  // Generate a 6-digit code
    }

    
    public int sendVerificationCode(String email) {
    	
    	if(!userRepository.findByEmail(email).isEmpty()) {
    		return 0;
    	}
    	else {
            String code = generateVerificationCode();
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your Verification Code.");
            message.setText("Your code is: " + code);
            mailSender.send(message);
        
        verificationRepository.deleteAllByEmail(email);
        verificationRepository.save(verifyEmail.builder()
        		.email(email)
        		.code(code)
        		.expiryTime(LocalDateTime.now()).build());
        System.out.println("Email"+" "+email+" "+code);
        System.out.println("Send Code");
        return 1;
    }
   }
    public boolean verifyCode(String email, String code) {
        //Optional<verifyEmail> verification = verificationRepository.findByEmailAndCode(email, code);
        if(verificationRepository.findByEmailAndCode(email, code).isEmpty()) return false;
        else return true;
    }
    
    public void sendVerificationCodeForResetPassword(String email) {
    	String code = generateVerificationCode();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Verification Code.");
        message.setText("Your code is: " + code);
        mailSender.send(message);
    
    verificationRepository.deleteAllByEmail(email);
    verificationRepository.save(verifyEmail.builder()
    		.email(email)
    		.code(code)
    		.expiryTime(LocalDateTime.now()).build());
    }
    
    @Scheduled(fixedRate = 60000) 
    public void deleteExpiredEntries() {
        LocalDateTime expiryLimit = LocalDateTime.now().minusMinutes(5);
        verificationRepository.deleteExpiredEntries(expiryLimit);
    }
}