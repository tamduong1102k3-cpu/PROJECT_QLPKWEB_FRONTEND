package com.qlpk.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseFixConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseFixConfig.class);

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void fixTableSchemas() {
        fixDangKyKhamBenhIdAutoIncrement();
    }

    private void fixDangKyKhamBenhIdAutoIncrement() {
        String sql = "ALTER TABLE dang_ky_kham_benh MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT";
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(sql);
            logger.info("Successfully added AUTO_INCREMENT to dang_ky_kham_benh.id column");
        } catch (Exception e) {
            // This might fail if already fixed - that's OK
            logger.warn("Could not alter dang_ky_kham_benh.id (may already be correct): {}", e.getMessage());
        }
    }
}