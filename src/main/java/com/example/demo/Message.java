package com.example.demo;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String senderEmail;
    private String receiverEmail;
    private String message;

    @Lob
    private byte[] fileData;
    private String fileName;
    private String contentType;

    @Builder.Default
    private String date = getCurrentTimeAndDate();
    @Builder.Default
    private Integer edited = 0;
    @Builder.Default
    private Integer deleted = 0;

    private static String getCurrentTimeAndDate() {
        ZoneId dhakaZone = ZoneId.of("Asia/Dhaka");
        LocalDateTime now = LocalDateTime.now(dhakaZone);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
        return now.format(formatter);
    }

}
