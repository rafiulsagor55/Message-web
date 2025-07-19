package com.example.demo;

import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class fileData {
	@Lob
    private byte[] fileData;
    private String fileName;
    private String contentType;
}

