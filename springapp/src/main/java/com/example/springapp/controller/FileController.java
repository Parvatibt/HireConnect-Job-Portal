package com.example.springapp.controller;

import com.example.springapp.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    private final FileStorageService storage;

    public FileController(FileStorageService storage) {
        this.storage = storage;
    }

    @GetMapping("/resumes/{filename:.+}")
    public ResponseEntity<Resource> getResume(@PathVariable String filename) {
        try {
            if (filename == null || filename.isBlank() || filename.contains("..")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename");
            }

            Resource resource = storage.loadAsResource(filename);
            if (resource == null || !resource.exists()) {
                log.info("Requested resume not found: {}", filename);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            Path path = storage.loadPath(filename);
            String probe = Files.probeContentType(path);
            MediaType contentType = (probe != null) ? MediaType.parseMediaType(probe) : MediaType.APPLICATION_OCTET_STREAM;

            String disposition = contentType.equals(MediaType.APPLICATION_PDF) ? "inline" : "attachment";
            String encoded = URLEncoder.encode(path.getFileName().toString(), StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(contentType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename*=UTF-8''" + encoded)
                    .body(resource);

        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.error("Error serving resume {}", filename, ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file");
        }
    }
}
