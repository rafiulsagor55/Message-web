package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ScheduledTaskService {

	@Autowired
    private TextRepository textRepository;

    @Scheduled(fixedRate = 60000)
    public void cleanUpOldEntriesText() {
        LocalDateTime expiryLimit = LocalDateTime.now().minusHours(1);
        textRepository.deleteOldEntries(expiryLimit);
        System.out.println("Deleted old entries test older than 1 hour.");
    } 
    
    @Autowired
    private clipboardFileRepository ClipboardFileRepository;
      
    @Scheduled(fixedRate = 60000)
    public void cleanUpOldEntriesFile() {
        LocalDateTime expiryLimit = LocalDateTime.now().minusHours(1);
        ClipboardFileRepository.deleteOldEntries(expiryLimit);
        System.out.println("Deleted old entries file older than 1 hour.");
    }
    
    
}

