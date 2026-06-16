package com.qlpk.backend.service.impl;

import com.qlpk.backend.service.DatabaseBackupService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
public class DatabaseBackupServiceImpl implements DatabaseBackupService {

    private static final Pattern JDBC_MYSQL_PATTERN =
            Pattern.compile("jdbc:mysql://([^:/]+)(?::(\\d+))?/([^?]+)");
    private static final Pattern SAFE_FILENAME_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._-]+\\.sql$");
    private static final DateTimeFormatter BACKUP_NAME_FORMAT =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${backup.directory:./backups}")
    private String backupDirectory;

    @Value("${backup.mysqldump-path:mysqldump}")
    private String mysqldumpPath;

    @Value("${backup.mysql-path:mysql}")
    private String mysqlPath;

    private Path backupDir;
    private String host;
    private int port;
    private String databaseName;
    private String resolvedMysqldumpPath;
    private String resolvedMysqlPath;

    private static final String[] MYSQL_DUMP_CANDIDATES = {
            "D:/wam64/bin/mysql/mysql8.2.0/bin/mysqldump.exe",
            "D:/wam64/bin/mariadb/mariadb11.2.2/bin/mysqldump.exe",
            "C:/xampp/mysql/bin/mysqldump.exe",
            "C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysqldump.exe",
            "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe"
    };

    private static final String[] MYSQL_CLIENT_CANDIDATES = {
            "D:/wam64/bin/mysql/mysql8.2.0/bin/mysql.exe",
            "D:/wam64/bin/mariadb/mariadb11.2.2/bin/mysql.exe",
            "C:/xampp/mysql/bin/mysql.exe",
            "C:/laragon/bin/mysql/mysql-8.0.30-winx64/bin/mysql.exe",
            "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe"
    };

    @PostConstruct
    public void init() throws IOException {
        parseJdbcUrl();
        backupDir = Paths.get(backupDirectory).toAbsolutePath().normalize();
        Files.createDirectories(backupDir);
        resolvedMysqldumpPath = resolveExecutable(mysqldumpPath, MYSQL_DUMP_CANDIDATES, "mysqldump");
        resolvedMysqlPath = resolveExecutable(mysqlPath, MYSQL_CLIENT_CANDIDATES, "mysql");
    }

    @Override
    public Map<String, Object> getDatabaseInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("databaseName", databaseName);
        info.put("host", host);
        info.put("port", port);
        info.put("backupDirectory", backupDir.toString());
        info.put("mysqldumpPath", resolvedMysqldumpPath);
        info.put("mysqlPath", resolvedMysqlPath);
        info.put("tool", "WAMP / phpMyAdmin (MySQL localhost)");
        return info;
    }

    @Override
    public Map<String, Object> createBackup() {
        String filename = "backup_" + databaseName + "_" + LocalDateTime.now().format(BACKUP_NAME_FORMAT) + ".sql";
        Path outputFile = resolveSafePath(filename);

        List<String> command = buildMysqlDumpCommand(outputFile);
        runProcess(command, "Không thể tạo bản sao lưu. Hãy kiểm tra MySQL client (mysqldump) đã được cài đặt và trong PATH.");

        Map<String, Object> result = new HashMap<>();
        result.put("filename", filename);
        try {
            result.put("size", Files.size(outputFile));
            result.put("createdAt", Files.getLastModifiedTime(outputFile).toInstant().toString());
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc thông tin file sao lưu: " + e.getMessage(), e);
        }
        result.put("message", "Sao lưu database thành công");
        return result;
    }

    @Override
    public List<Map<String, Object>> listBackups() {
        List<Map<String, Object>> backups = new ArrayList<>();

        try (Stream<Path> paths = Files.list(backupDir)) {
            paths.filter(path -> path.getFileName().toString().endsWith(".sql"))
                    .sorted(Comparator.comparing(path -> {
                        try {
                            return Files.getLastModifiedTime(path);
                        } catch (IOException e) {
                            return null;
                        }
                    }, Comparator.nullsLast(Comparator.reverseOrder())))
                    .forEach(path -> {
                        try {
                            Map<String, Object> item = new HashMap<>();
                            String name = path.getFileName().toString();
                            item.put("filename", name);
                            item.put("size", Files.size(path));
                            item.put("createdAt", Files.getLastModifiedTime(path).toInstant().toString());
                            backups.add(item);
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc danh sách bản sao lưu: " + e.getMessage(), e);
        }

        return backups;
    }

    @Override
    public byte[] downloadBackup(String filename) {
        Path file = resolveSafePath(filename);
        if (!Files.exists(file)) {
            throw new RuntimeException("Không tìm thấy file sao lưu: " + filename);
        }
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new RuntimeException("Không thể tải file sao lưu: " + e.getMessage(), e);
        }
    }

    @Override
    public void restoreFromBackup(String filename) {
        Path file = resolveSafePath(filename);
        if (!Files.exists(file)) {
            throw new RuntimeException("Không tìm thấy file sao lưu: " + filename);
        }
        restoreFromPath(file);
    }

    @Override
    public void restoreFromUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn file SQL để phục hồi");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".sql")) {
            throw new RuntimeException("Chỉ chấp nhận file .sql");
        }

        Path tempFile = null;
        try {
            tempFile = Files.createTempFile(backupDir, "restore_upload_", ".sql");
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }
            restoreFromPath(tempFile);
        } catch (IOException e) {
            throw new RuntimeException("Không thể đọc file upload: " + e.getMessage(), e);
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {
                }
            }
        }
    }

    @Override
    public void deleteBackup(String filename) {
        Path file = resolveSafePath(filename);
        if (!Files.exists(file)) {
            throw new RuntimeException("Không tìm thấy file sao lưu: " + filename);
        }
        try {
            Files.delete(file);
        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa file sao lưu: " + e.getMessage(), e);
        }
    }

    private void restoreFromPath(Path sqlFile) {
        List<String> command = buildMysqlRestoreCommand();
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectInput(sqlFile.toFile());
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException("Phục hồi database thất bại: " + output.trim());
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Không thể phục hồi database. Hãy kiểm tra MySQL client (mysql) đã được cài đặt: " + e.getMessage(), e);
        }
    }

    private List<String> buildMysqlDumpCommand(Path outputFile) {
        List<String> command = new ArrayList<>();
        command.add(resolvedMysqldumpPath);
        command.add("-h");
        command.add(host);
        command.add("-P");
        command.add(String.valueOf(port));
        command.add("-u");
        command.add(username);
        command.add("--password=" + (password != null ? password : ""));
        command.add("--routines");
        command.add("--triggers");
        command.add("--single-transaction");
        command.add("--default-character-set=utf8mb4");
        command.add("--result-file=" + outputFile.toAbsolutePath());
        command.add(databaseName);
        return command;
    }

    private List<String> buildMysqlRestoreCommand() {
        List<String> command = new ArrayList<>();
        command.add(resolvedMysqlPath);
        command.add("-h");
        command.add(host);
        command.add("-P");
        command.add(String.valueOf(port));
        command.add("-u");
        command.add(username);
        command.add("--password=" + (password != null ? password : ""));
        command.add("--default-character-set=utf8mb4");
        command.add(databaseName);
        return command;
    }

    private void runProcess(List<String> command, String errorPrefix) {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        try {
            Process process = processBuilder.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new RuntimeException(errorPrefix + " Chi tiết: " + output.trim());
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(errorPrefix + " " + e.getMessage(), e);
        }
    }

    private Path resolveSafePath(String filename) {
        if (filename == null || !SAFE_FILENAME_PATTERN.matcher(filename).matches()) {
            throw new RuntimeException("Tên file không hợp lệ");
        }
        Path resolved = backupDir.resolve(filename).normalize();
        if (!resolved.startsWith(backupDir)) {
            throw new RuntimeException("Tên file không hợp lệ");
        }
        return resolved;
    }

    private void parseJdbcUrl() {
        Matcher matcher = JDBC_MYSQL_PATTERN.matcher(jdbcUrl);
        if (!matcher.find()) {
            throw new IllegalStateException("Không thể phân tích spring.datasource.url: " + jdbcUrl);
        }
        host = matcher.group(1);
        port = matcher.group(2) != null ? Integer.parseInt(matcher.group(2)) : 3306;
        databaseName = matcher.group(3);
    }

    private String resolveExecutable(String configuredPath, String[] candidates, String fallbackName) {
        if (configuredPath != null && !configuredPath.isBlank()) {
            Path configured = Paths.get(configuredPath);
            if (Files.exists(configured)) {
                return configured.toAbsolutePath().toString();
            }
        }

        for (String candidate : candidates) {
            Path path = Paths.get(candidate);
            if (Files.exists(path)) {
                return path.toAbsolutePath().toString();
            }
        }

        return configuredPath != null && !configuredPath.isBlank() ? configuredPath : fallbackName;
    }
}