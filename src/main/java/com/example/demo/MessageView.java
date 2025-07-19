package com.example.demo;

public interface MessageView {
	Long getId();
    String getSenderEmail();
    String getReceiverEmail();
    String getMessage();
    String getFileName();
    String getContentType();
    String getDate();
    Integer getEdited();
    Integer getDeleted();
}
