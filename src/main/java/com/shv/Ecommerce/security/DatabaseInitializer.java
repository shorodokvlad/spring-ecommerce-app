package com.shv.Ecommerce.security;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Alter column data type to TEXT for unlimited length
            jdbcTemplate.execute("ALTER TABLE products ALTER COLUMN description TYPE TEXT");
            System.out.println("Successfully altered products.description column type to TEXT");

            // Clean up legacy non-JSON text descriptions in database
            int updatedRows = jdbcTemplate.update(
                "UPDATE products SET description = NULL WHERE description IS NOT NULL AND description NOT LIKE '[%' AND description NOT LIKE '{%'"
            );
            if (updatedRows > 0) {
                System.out.println("Cleared legacy non-JSON text description from " + updatedRows + " product(s).");
            }
        } catch (Exception e) {
            System.err.println("DatabaseInitializer exception: " + e.getMessage());
        }
    }
}
