package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Random;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/clipboard")
public class ClipboardTextController {

    @Autowired
    private TextRepository textRepository;

    private String generateCode() {
        Random random = new Random();
        return String.format("%04d", random.nextInt(10000)); // Generate 4-digit code
    }

    @PostMapping("/send-text")
    public synchronized ResponseEntity<String> sendText(@RequestBody String text) {
        String code = generateCode();
        while(!textRepository.findByCode(code).isEmpty()) {
        	code = generateCode();
        }
        Text textEntry = new Text();
        textEntry.setCode(code);
        textEntry.setText(text);
        textRepository.save(textEntry);
        return ResponseEntity.ok(code);
    }

    @GetMapping("/retrieve-text/{code}")
    public synchronized ResponseEntity<String> retrieveText(@PathVariable String code) {
        Optional<Text> textEntry = textRepository.findByCode(code);
        if (textEntry.isEmpty()) {
            return ResponseEntity.status(404).body("Text not found.");
        }
        return ResponseEntity.ok(textEntry.get().getText());
    }
}
