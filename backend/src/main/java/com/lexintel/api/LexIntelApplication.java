package com.lexintel.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

@SpringBootApplication
public class LexIntelApplication {
    public static void main(String[] args) {
        loadEnv();
        SpringApplication.run(LexIntelApplication.class, args);
    }

    private static void loadEnv() {
        // Look for .env in current directory or parent directory
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (!envFile.exists()) {
            envFile = new File("backend/.env");
        }

        if (envFile.exists() && envFile.isFile()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }
                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();
                        // Strip surrounding quotes if present
                        if (value.startsWith("\"") && value.endsWith("\"")) {
                            value = value.substring(1, value.length() - 1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.substring(1, value.length() - 1);
                        }
                        System.setProperty(key, value);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to load .env file: " + e.getMessage());
            }
        }
    }
}
