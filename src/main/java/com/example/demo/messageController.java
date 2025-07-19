package com.example.demo;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "*")
public class messageController {
	
	@Autowired
	private MessageRepository messageRepository;
	 @Autowired
	    private SimpMessagingTemplate simpMessagingTemplate;
	
	@MessageMapping("/sendMessage")
	public synchronized void saveAndSendMessage(@Payload Message message) {
		Message MSG= messageRepository.save(message);
		simpMessagingTemplate.convertAndSendToUser(message.getSenderEmail(),"/receivedMessage",MSG);
		simpMessagingTemplate.convertAndSendToUser(message.getReceiverEmail(),"/receivedMessage",MSG);
	}
	
	@MessageMapping("/sendMessageForDelete")
	public synchronized void deleteMessage(@Payload Message message) {
		messageRepository.clearFileDataAndMarkAsDeleted(message.getId(),message.getMessage());
		simpMessagingTemplate.convertAndSendToUser(message.getSenderEmail(),"/deletedMessage",message);
		simpMessagingTemplate.convertAndSendToUser(message.getReceiverEmail(),"/deletedMessage",message);
	}
	
//	 if clearFileDataAndMarkAsDeleted is async
//	@MessageMapping("/sendMessageForDelete")
//	public void deleteMessage(@Payload Message message) {
//	    CompletableFuture<Void> future = messageRepository
//	        .clearFileDataAndMarkAsDeleted(message.getId(), message.getMessage());
//
//	    future.thenRun(() -> {
//	        simpMessagingTemplate.convertAndSendToUser(message.getSenderEmail(), "/deletedMessage", message);
//	        simpMessagingTemplate.convertAndSendToUser(message.getReceiverEmail(), "/deletedMessage", message);
//	    }).exceptionally(ex -> {
//	        // Optional: log error or send error response via WebSocket
//	        ex.printStackTrace();
//	        return null;
//	    });
//	}
//	
	@MessageMapping("/sendMessageForEdit")
	public synchronized void editMessage(@Payload Message message) {
		messageRepository.updateMessageById(message.getId(),message.getMessage());
		simpMessagingTemplate.convertAndSendToUser(message.getSenderEmail(),"/editedMessage",message);
		simpMessagingTemplate.convertAndSendToUser(message.getReceiverEmail(),"/editedMessage",message);
	}
	
	@PostMapping("/sendFileDataToController")
	public synchronized ResponseEntity<?> saveAndSendFileData(@RequestParam MultipartFile file,
			@RequestParam String senderEmail,
			@RequestParam String receiverEmail) {
		
		try {
	        InputStream inputStream = file.getInputStream();
	        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
	        byte[] buffer = new byte[4096];
	        int bytesRead;
	        while ((bytesRead = inputStream.read(buffer)) != -1) {
	            outputStream.write(buffer, 0, bytesRead);
	        }
	        Message MSG=messageRepository.save(Message.builder()
	        		.senderEmail(senderEmail)
	        		.receiverEmail(receiverEmail)
	        		.contentType(file.getContentType())
	        		.fileName(file.getOriginalFilename())
	        		.fileData(outputStream.toByteArray())
	        		.build());
	        
	        if(!MSG.getContentType().startsWith("image")) {
	        	MSG.setFileData(null);
	        }
	        simpMessagingTemplate.convertAndSendToUser(senderEmail,"/receivedFile",MSG);
			simpMessagingTemplate.convertAndSendToUser(receiverEmail,"/receivedFile",MSG);
	        //MSG=null;
	        return ResponseEntity.ok(MSG.getId()); // Return the generated code
	    } catch (Exception e) {
	        e.printStackTrace(); // Log the error
	        return ResponseEntity.status(500).body("Error: " + e.getMessage());
	    }
		
	}
	@GetMapping("/downloadMessageFile/{id}")
	public synchronized ResponseEntity<?> downloadFile(@PathVariable Long id) {
	    try {
	        Optional<Message> optionalMessage = messageRepository.findById(id);

	        Message message = optionalMessage.get();

	        ByteArrayResource resource = new ByteArrayResource(message.getFileData());

	        HttpHeaders headers = new HttpHeaders();
	        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + message.getFileName() + "\"");

	        return ResponseEntity.ok()
	                .headers(headers)
	                .contentType(MediaType.parseMediaType(message.getContentType()))
	                .body(resource);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("An error occurred while downloading the file");
	    }
	}
	
	@GetMapping("/viewMessageFile/{id}")
	public synchronized ResponseEntity<?> viewFile(@PathVariable Long id) {
	    try {
	        Optional<Message> optionalMessage = messageRepository.findById(id);

	        Message message = optionalMessage.get();

	        ByteArrayResource resource = new ByteArrayResource(message.getFileData());

	        return ResponseEntity.ok()
	                .contentType(MediaType.parseMediaType(message.getContentType()))
	                .body(resource);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("An error occurred while downloading the file");
	    }
	}
	
	@GetMapping("/loadMessage")
	public synchronized List<MessageView>loadMessages(@RequestParam String senderEmail,@RequestParam String receiverEmail){
		List<MessageView>message=messageRepository.findMessagesBySenderAndReceiver(senderEmail, receiverEmail);
		return message;
	}
	
	@GetMapping("/showImageWhereMessageLoad/{id}")
	public synchronized ResponseEntity<?> showImageWhereMessageLoad(@PathVariable Long id) {
	    try {
	        Optional<Message> optionalMessage = messageRepository.findById(id);
	        Message message = optionalMessage.get();
	        ByteArrayResource resource = new ByteArrayResource(message.getFileData());
	        return ResponseEntity.ok()
	                .contentType(MediaType.parseMediaType(message.getContentType()))
	                .body(resource);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("An error occurred while downloading the file");
	    }
	}
	


}
