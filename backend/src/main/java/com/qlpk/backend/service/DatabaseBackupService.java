package com.qlpk.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface DatabaseBackupService {

    Map<String, Object> getDatabaseInfo();

    Map<String, Object> createBackup();

    List<Map<String, Object>> listBackups();

    byte[] downloadBackup(String filename);

    void restoreFromBackup(String filename);

    void restoreFromUpload(MultipartFile file);

    void deleteBackup(String filename);
}