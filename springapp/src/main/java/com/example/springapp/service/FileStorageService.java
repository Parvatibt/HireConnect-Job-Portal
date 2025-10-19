package com.example.springapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Date;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadsRoot;
    private final Path resumesDir;

    public FileStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.uploadsRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.resumesDir = this.uploadsRoot.resolve("resumes").normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(resumesDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory " + resumesDir, e);
        }
    }

    /**
     * Store resume file on disk and return the generated stored filename (not full URL).
     * Caller is responsible for persisting the returned filename in DB (Application.resumeFilename).
     */
    public String storeResume(String username, MultipartFile file) {
        try {
            String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "resume" : file.getOriginalFilename());
            // sanitize original file name
            original = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot >= 0) ext = original.substring(dot);
            String storedFilename = (username == null ? "anon" : username.replaceAll("[^a-zA-Z0-9._-]", "_"))
                    + "-" + UUID.randomUUID().toString() + ext;
            Path dest = resumesDir.resolve(storedFilename).normalize();
            // prevent escaping
            if (!dest.startsWith(resumesDir)) {
                throw new RuntimeException("Cannot store file outside resumes directory");
            }
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return storedFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    /**
     * Resolve a stored filename to an absolute path. Prevent path traversal.
     */
    public Path loadPath(String filename) {
        String clean = StringUtils.cleanPath(filename);
        if (clean.contains("..")) throw new IllegalArgumentException("Invalid filename");
        Path resolved = resumesDir.resolve(clean).normalize();
        if (!resolved.startsWith(resumesDir)) throw new IllegalArgumentException("Invalid filename");
        return resolved;
    }

    /**
     * Return Resource for streaming (or null if not found).
     */
    public Resource loadAsResource(String filename) {
        try {
            Path p = loadPath(filename);
            if (!Files.exists(p) || !Files.isRegularFile(p)) return null;
            return new UrlResource(p.toUri());
        } catch (MalformedURLException | IllegalArgumentException e) {
            return null;
        }
    }

    /** Convenience getter for resumesDir (if you need) */
    public Path getResumesDir() {
        return resumesDir;
    }

    /** Optional: return the configured uploads root for troubleshooting. */
    public Path getUploadsRoot() {
        return uploadsRoot;
    }
}
