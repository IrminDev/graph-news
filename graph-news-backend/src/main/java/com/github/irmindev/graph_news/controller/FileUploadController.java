package com.github.irmindev.graph_news.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.github.irmindev.graph_news.model.response.misc.FileReaderResponse;
import com.github.irmindev.graph_news.service.FileReaderService;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {
    private final FileReaderService fileReaderService;

    @Autowired
    public FileUploadController(FileReaderService fileReaderService) {
        this.fileReaderService = fileReaderService;
    }

    @PostMapping("/pdf")
    public ResponseEntity<FileReaderResponse> uploadPdf(@RequestPart("file") MultipartFile file) {
        String content = fileReaderService.readPdf(file);
        return ResponseEntity.ok().body(new FileReaderResponse.Success(content));
    }

    @PostMapping("/txt")
    public ResponseEntity<FileReaderResponse> uploadTxt(@RequestPart("file") MultipartFile file) {
        String content = fileReaderService.readTxt(file);
        return ResponseEntity.ok().body(new FileReaderResponse.Success(content));
    }

    @PostMapping("/docx")
    public ResponseEntity<FileReaderResponse> uploadDocx(@RequestPart("file") MultipartFile file) {
        String content = fileReaderService.readDocx(file);
        return ResponseEntity.ok().body(new FileReaderResponse.Success(content));
    }
}
