package com.example.demo;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;

@RestController
@CrossOrigin(origins = "*")
public class ClipboardFileController {
	
	@Autowired
	private clipboardFileRepository fileDetails;
	
	private String generateCode() {
        Random random = new Random();
        return String.format("%04d", random.nextInt(10000));
    }
	
	@PostMapping("/sendFileClipBoard")
	public synchronized ResponseEntity<?> sendClipBoardFile(@RequestParam MultipartFile file) {
	    String code = generateCode();
	    while (fileDetails.findFileNameByCode(code) != null) {
	        code = generateCode();
	    }
	    try {
	        InputStream inputStream = file.getInputStream();
	        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
	        byte[] buffer = new byte[4096];
	        int bytesRead;
	        while ((bytesRead = inputStream.read(buffer)) != -1) {
	            outputStream.write(buffer, 0, bytesRead);
	        }
	        clipboardFile fileEntity = new clipboardFile();
	        fileEntity.setCode(code);
	        fileEntity.setFileName(file.getOriginalFilename());
	        fileEntity.setContentType(file.getContentType());
	        fileEntity.setFileData(outputStream.toByteArray());

	        fileDetails.save(fileEntity); 
	        return ResponseEntity.ok(code); 
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(500).body("Error: " + e.getMessage());
	    }
	}


	
	@GetMapping("/retrieveFileName/{code}")
    public synchronized ResponseEntity<?> retrieveFileName(@PathVariable String code) {
		
		String fileName= new String(fileDetails.findFileNameByCode(code));
		if (fileName.equals(null) || fileName.equals("")) {
			return ResponseEntity.status(404).body("File not Found!");
		}
		else {
			return ResponseEntity.ok(fileName);
		}
       
    }
	
	@GetMapping("/downloadClipBoardFile/{code}")
    public synchronized ResponseEntity<Resource> downloadFile(@PathVariable String code) {
		
        try {
        	
                clipboardFile file= fileDetails.findByCode(code).get(0);
                byte[] fileData=file.getFileData();
                ByteArrayResource resource = new ByteArrayResource(fileData);
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getFileName());
                return ResponseEntity.ok()
                        .headers(headers)
                        .contentType(MediaType.parseMediaType(file.getContentType()))
                        .body(resource);
           
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

}
