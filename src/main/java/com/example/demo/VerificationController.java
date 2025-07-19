package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class VerificationController {
	@Autowired
	VerificationService verificationService;
	
	
	@PostMapping("/sendCode")
	public synchronized int sendCode(@RequestParam String email) {
		
		System.out.println("send code");
		int flag=verificationService.sendVerificationCode(email);
            return flag;
				
	}
	
	@PostMapping("/verifyCode")
	public synchronized String verifyCode(@RequestParam String code, @RequestParam String email) {
		System.out.println(email + " , " +code);
		boolean flag=verificationService.verifyCode(email, code);
		System.out.println(flag);
		if(flag==true) return "valid";
		else return "Invalid Code!";
	}
	
	@PostMapping("/sendCodeForResetPassword")
	public synchronized void sendCodeForResetPassword(@RequestParam String email) {
		verificationService.sendVerificationCodeForResetPassword(email);
		
	}
	

}
