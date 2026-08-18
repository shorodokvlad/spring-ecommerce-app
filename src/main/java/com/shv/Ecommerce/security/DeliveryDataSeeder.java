package com.shv.Ecommerce.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.shv.Ecommerce.entity.DeliveryZone;
import com.shv.Ecommerce.repository.DeliveryZoneRepo;
import com.shv.Ecommerce.repository.LocalityRepo;
import com.shv.Ecommerce.util.LocalityNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeliveryDataSeeder implements CommandLineRunner {

    private final DeliveryZoneRepo deliveryZoneRepo;
    private final LocalityRepo localityRepo;
    private final JdbcTemplate jdbcTemplate;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    private static final List<String> MAJOR_HUBS = List.of(
            "Bucuresti", "Ilfov", "Cluj", "Timis", "Iasi", "Constanta", "Brasov",
            "Prahova", "Arges", "Dolj", "Sibiu", "Bihor", "Mures", "Galati"
    );

    @Override
    public void run(String... args) {
        seedLocalities();
        seedZones();
    }

    private void seedZones() {
        if (deliveryZoneRepo.count() > 0) {
            return;
        }
        log.info("Seeding delivery zones...");

        // Romania: country-wide default row (fallback for unknown counties)
        deliveryZoneRepo.save(zone("RO", null, 2, 1, "4.99", "9.99", "50"));

        for (String county : localityRepo.findDistinctCounties()) {
            boolean hub = MAJOR_HUBS.contains(county);
            deliveryZoneRepo.save(zone("RO", county, hub ? 1 : 2, 1, "4.99", "9.99", "50"));
        }

        // European Union country groups (EU-ready; UI ships Romania-first)
        List<String> near = List.of("HU", "BG", "MD", "UA", "RS");
        for (String c : near) {
            deliveryZoneRepo.save(zone(c, null, 3, 2, "9.99", "14.99", "100"));
        }
        List<String> mid = List.of("DE", "FR", "IT", "ES", "NL", "BE", "AT", "PL", "CZ", "SK",
                "GR", "PT", "IE", "DK", "SE", "FI", "HR", "SI", "EE", "LV", "LT", "LU", "MT", "CY");
        for (String c : mid) {
            deliveryZoneRepo.save(zone(c, null, 5, 3, "14.99", "24.99", "150"));
        }
        List<String> far = List.of("GB", "CH", "NO", "IS", "TR");
        for (String c : far) {
            deliveryZoneRepo.save(zone(c, null, 7, 5, "19.99", "34.99", "200"));
        }

        log.info("Delivery zones seeded.");
    }

    private void seedLocalities() {
        if (localityRepo.count() > 0) {
            return;
        }
        log.info("Seeding Romanian localities...");
        try {
            List<Map<String, Object>> entries = objectMapper.readValue(
                    new ClassPathResource("data/localities_ro.json").getInputStream(),
                    new TypeReference<List<Map<String, Object>>>() {}
            );

            int batchSize = 1000;
            for (int i = 0; i < entries.size(); i += batchSize) {
                List<Map<String, Object>> batch = entries.subList(i, Math.min(i + batchSize, entries.size()));
                jdbcTemplate.batchUpdate(
                        "INSERT INTO localities (county, name, search_name, population) VALUES (?, ?, ?, ?)",
                        batch,
                        batch.size(),
                        (ps, entry) -> {
                            String name = (String) entry.get("name");
                            ps.setString(1, (String) entry.get("county"));
                            ps.setString(2, name);
                            ps.setString(3, LocalityNormalizer.normalize(name));
                            ps.setObject(4, entry.get("population"));
                        }
                );
            }
            log.info("Seeded {} Romanian localities.", entries.size());
        } catch (Exception e) {
            log.error("Failed to seed localities: {}", e.getMessage());
        }
    }

    private DeliveryZone zone(String country, String county, int std, int exp,
                              String price, String expressPrice, String threshold) {
        DeliveryZone zone = new DeliveryZone();
        zone.setCountry(country);
        zone.setCounty(county);
        zone.setTransitDaysStandard(std);
        zone.setTransitDaysExpress(exp);
        zone.setPrice(new BigDecimal(price));
        zone.setExpressPrice(new BigDecimal(expressPrice));
        zone.setFreeThreshold(new BigDecimal(threshold));
        return zone;
    }
}
