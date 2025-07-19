package com.example.demo;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ConnectedUserRepository connectedUserRepository;
    
    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/saveUserInfo")
    public synchronized ResponseEntity<?> createUser(@Valid @RequestBody User user) {
    	List<User> list= userRepository.findByEmail(user.getEmail());
    	if(list.isEmpty()) {
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(1);
    	}
    	else if(!list.isEmpty()){
    		return ResponseEntity.ok(2);
    	}
    	else {
    		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    	}
    }
    
    @PostMapping("/resetPassword")
    public synchronized ResponseEntity<?> resetPassword(@Valid @RequestBody User user) {
    	List<User> list= userRepository.findByEmail(user.getEmail());
    	if(!list.isEmpty()) {
            User existingUser = list.get(0);
            existingUser.setPassword(user.getPassword()); // Update the password
            userRepository.save(existingUser);
            
            return ResponseEntity.status(200).body(1);
    	}
    	else {
    		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    	}
    }
    
    @PostMapping("/verifyLogin")
    public synchronized ResponseEntity<?> verifyLogin(@RequestParam String email,@RequestParam String password) {
    	List<User> list= userRepository.findByEmailAndPassword(email, password);
    	if(list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(0);
    	}
    	else if(!list.isEmpty()){
    		return ResponseEntity.ok(1);
    	}
    	else {
    		return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    	}
    }
    @PostMapping("/verifyEmail")
    public synchronized ResponseEntity<?>verifyEmail(@RequestParam String email){
    	if(userRepository.findByEmail(email).isEmpty()) return ResponseEntity.ok(1);
    	else return ResponseEntity.ok(0);
    }
    @PostMapping("/updatePicture")
    public synchronized ResponseEntity<?>updatePicture(@RequestParam MultipartFile file,@RequestParam String email){
    	List<User>userList=userRepository.findByEmail(email);
    	try {
			User user=User.builder()
					.id(userList.get(0).getId())
					.email(email)
					.userName(userList.get(0).getUserName())
					.password(userList.get(0).getPassword())
					.imageData(FileUtils.compressFile(file.getBytes()))
					.contentType(file.getContentType())
					.build();
			userRepository.save(user);
			userList.clear();
		} catch (IOException e) {
			e.printStackTrace();
		}
    	return ResponseEntity.ok("Profile Picture Update Successfully.");   	
    }
    
    @PostMapping("/updateUserName")
    public synchronized ResponseEntity<?>updateUserName(@RequestParam String email,@RequestParam String userName){
    	if(userName.length()<2) {
    		return ResponseEntity.status(400).body(null);
    	}
    	else {
    		User user=userRepository.findByEmail(email).get(0);
    		user.setUserName(userName);
    		userRepository.save(user);
    		return ResponseEntity.status(200).body("User Name Updated Successfully.");
    	}
    }
    
    @PostMapping("/updatePassword")
    public synchronized ResponseEntity<?>updatepassword(@RequestParam String email,@RequestParam String prePass,@RequestParam String postPass){
    	if(postPass.length()<4) {
    		return ResponseEntity.status(400).body(null);
    	}
    	else {
    		User user=userRepository.findByEmail(email).get(0);
    		if(user.getPassword().equals(prePass)) {
    			user.setPassword(postPass);
        		userRepository.save(user);
        		return ResponseEntity.status(200).body("Password Update Successfully.");
    		}
    		else {
    			return ResponseEntity.status(200).body("Invalid previous Password!");
    		}
    		
    	}
    }
    
    @GetMapping("/viewProfilePicture")
    public synchronized ResponseEntity<?>viewProfilePicture(@RequestParam String email){
    	List<User>userList=userRepository.findByEmail(email);
    	if(userList.get(0).getContentType()!=null) {
    		return ResponseEntity.ok()
    				.contentType(MediaType.parseMediaType(userList.get(0).getContentType()))
    				.body(FileUtils.decompressFile(userList.get(0).getImageData()));
    	}
    	else {
    		return ResponseEntity.status(404).body(null);
    	}
    }

    
    @GetMapping("/viewConnectedUser")
    public synchronized ResponseEntity<?>viewConnectedUser(@RequestParam String userEmail){
    	List<ConnectedUser>userList=connectedUserRepository.findByUserEmail(userEmail);
    	userList.addAll(connectedUserRepository.findByFriendEmail(userEmail));
    	userList=userList.stream()
    			.sorted(Comparator.comparingLong(ConnectedUser::getId).reversed())
    			.collect(Collectors.toList());
    	System.out.println(userList);
    	if (userList.isEmpty()) {
    		return ResponseEntity.status(404).body(null);
		}
    	else {
    		return ResponseEntity.status(200).body(userList);
    	}
    }
    
    @MessageMapping("/addFriend")
    public synchronized void receiveUser(@Payload ConnectedUser userlist) {
    	
    	if(userRepository.findByEmail(userlist.getFriendEmail()).isEmpty()) {
    		simpMessagingTemplate.convertAndSendToUser(userlist.getUserEmail(),"/addFriendPage","User does not Exist for "+userlist.getFriendEmail());
    	}
    	else if(!connectedUserRepository.findByUserEmailAndFriendEmailOrFriendEmailAndUserEmail(userlist.getUserEmail(), userlist.getFriendEmail(), userlist.getFriendEmail(), userlist.getUserEmail()).isEmpty()) {
    		simpMessagingTemplate.convertAndSendToUser(userlist.getUserEmail(),"/addFriendPage",userlist.getFriendEmail()+" already connected with you!");
    	}
    	else {
    		connectedUserRepository.save(userlist);
    		//userRepository.findByEmail(userlist.getFriendEmail()).get(0);
    		User friend=userRepository.findByEmail(userlist.getFriendEmail()).get(0);
    		if(friend.getContentType()!=null) {
    			friend.setImageData(FileUtils.decompressFile(friend.getImageData()));
    		}	
    		User me=userRepository.findByEmail(userlist.getUserEmail()).get(0);
    		if(me.getContentType()!=null) {
    			me.setImageData(FileUtils.decompressFile(me.getImageData()));
    		}
    		simpMessagingTemplate.convertAndSendToUser(userlist.getUserEmail(),"/addFriend",friend);
    		simpMessagingTemplate.convertAndSendToUser(userlist.getFriendEmail(),"/addFriend",me);
    		simpMessagingTemplate.convertAndSendToUser(userlist.getUserEmail(),"/addFriendPage1",userlist.getFriendEmail());
    	}
    	
    }
    
    @GetMapping("/friendsInfo")
    public synchronized ResponseEntity<?>friendsInfo(@RequestParam String email){
    	User friend=userRepository.findByEmail(email).get(0);
    	if (friend.getContentType()!=null) {
    		friend.setImageData(FileUtils.decompressFile(friend.getImageData()));
		}	
		return ResponseEntity.ok(friend);
    }
    
    @GetMapping("/viewUserInfo")
    public synchronized ResponseEntity<?>viewUserInfo(@RequestParam String email){
    	User me=userRepository.findByEmail(email).get(0);
		me.setImageData(null);
		return ResponseEntity.ok(me);
    }
    
    
}
