package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.DeliveryEstimateDto;
import com.shv.Ecommerce.dto.DeliveryOptionDto;
import com.shv.Ecommerce.dto.LocalityDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.DeliveryZone;
import com.shv.Ecommerce.entity.Locality;
import com.shv.Ecommerce.repository.DeliveryZoneRepo;
import com.shv.Ecommerce.repository.LocalityRepo;
import com.shv.Ecommerce.service.interf.IDeliveryService;
import com.shv.Ecommerce.util.LocalityNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeliveryServiceImpl implements IDeliveryService {

    private final DeliveryZoneRepo deliveryZoneRepo;
    private final LocalityRepo localityRepo;

    @Value("${shipping.processing-days:1}")
    private int processingDays;

    private static final BigDecimal DEFAULT_PRICE = new BigDecimal("4.99");
    private static final BigDecimal DEFAULT_EXPRESS_PRICE = new BigDecimal("9.99");
    private static final BigDecimal DEFAULT_FREE_THRESHOLD = new BigDecimal("50");
    private static final int DEFAULT_TRANSIT_STANDARD = 2;
    private static final int DEFAULT_TRANSIT_EXPRESS = 1;

    @Override
    public Response getEstimate(String country, String county, String locality, String source, BigDecimal subtotal) {
        String countryCode = (country == null || country.isBlank()) ? "RO" : country.trim().toUpperCase();

        boolean resolvedFromLocality = false;
        if ((county == null || county.isBlank()) && locality != null && !locality.isBlank()) {
            Optional<Locality> matched = localityRepo.findFirstBySearchNameOrderByPopulationDesc(
                    LocalityNormalizer.normalize(locality));
            if (matched.isPresent()) {
                county = matched.get().getCounty();
                locality = matched.get().getName();
                resolvedFromLocality = true;
            }
        }

        DeliveryZone zone = resolveZone(countryCode, county);
        BigDecimal subtotalValue = subtotal;

        List<DeliveryOptionDto> options = new ArrayList<>();
        options.add(buildOption("standard", "Standard Delivery", zone.getTransitDaysStandard(),
                zone.getPrice(), zone.getFreeThreshold(), subtotalValue));
        options.add(buildOption("express", "Express Delivery", zone.getTransitDaysExpress(),
                zone.getExpressPrice(), zone.getFreeThreshold(), subtotalValue));

        DeliveryEstimateDto estimate = DeliveryEstimateDto.builder()
                .source((source != null && !source.isBlank()) ? source : (resolvedFromLocality ? "detected" : "manual"))
                .country(countryCode)
                .county(county)
                .locality(locality)
                .localityResolved(resolvedFromLocality)
                .subtotal(subtotalValue)
                .freeThreshold(zone.getFreeThreshold())
                .options(options)
                .pickupPoints(new ArrayList<>())
                .build();

        return Response.builder()
                .status(200)
                .message("success")
                .deliveryEstimate(estimate)
                .build();
    }

    @Override
    public Response getCounties() {
        List<String> counties = localityRepo.findDistinctCounties();
        return Response.builder()
                .status(200)
                .message("success")
                .countyList(counties)
                .build();
    }

    @Override
    public Response getLocalities(String county) {
        List<LocalityDto> localities = new ArrayList<>();
        if (county != null && !county.isBlank()) {
            localities = localityRepo.findByCountyIgnoreCaseOrderByNameAsc(county.trim()).stream()
                    .map(l -> LocalityDto.builder().id(l.getId()).name(l.getName()).build())
                    .collect(Collectors.toList());
        }
        return Response.builder()
                .status(200)
                .message("success")
                .localityList(localities)
                .build();
    }

    private DeliveryZone resolveZone(String country, String county) {
        if (county != null && !county.isBlank()) {
            Optional<DeliveryZone> countyZone = deliveryZoneRepo.findByCountryIgnoreCaseAndCountyIgnoreCase(country, county.trim());
            if (countyZone.isPresent()) {
                return countyZone.get();
            }
        }
        Optional<DeliveryZone> countryZone = deliveryZoneRepo.findByCountryIgnoreCase(country);
        if (countryZone.isPresent()) {
            return countryZone.get();
        }
        return fallbackZone();
    }

    private DeliveryZone fallbackZone() {
        DeliveryZone zone = new DeliveryZone();
        zone.setCountry("EU");
        zone.setTransitDaysStandard(DEFAULT_TRANSIT_STANDARD);
        zone.setTransitDaysExpress(DEFAULT_TRANSIT_EXPRESS);
        zone.setPrice(DEFAULT_PRICE);
        zone.setExpressPrice(DEFAULT_EXPRESS_PRICE);
        zone.setFreeThreshold(DEFAULT_FREE_THRESHOLD);
        return zone;
    }

    private DeliveryOptionDto buildOption(String service, String label, int transitDays,
                                          BigDecimal price, BigDecimal freeThreshold, BigDecimal subtotal) {
        LocalDate etaFrom = firstDeliveryDate(LocalDate.now().plusDays(processingDays));
        LocalDate etaTo = etaFrom;
        for (int i = 1; i < transitDays; i++) {
            etaTo = firstDeliveryDate(etaTo.plusDays(1));
        }

        boolean free = subtotal != null && freeThreshold != null && subtotal.compareTo(freeThreshold) >= 0;

        return DeliveryOptionDto.builder()
                .service(service)
                .label(label)
                .etaFrom(etaFrom)
                .etaTo(etaTo)
                .price(price)
                .free(free)
                .build();
    }

    private LocalDate firstDeliveryDate(LocalDate date) {
        while (isNonDeliveryDay(date)) {
            date = date.plusDays(1);
        }
        return date;
    }

    private boolean isNonDeliveryDay(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SUNDAY || romanianHolidays().contains(date);
    }

    private Set<LocalDate> romanianHolidays() {
        Set<LocalDate> holidays = new HashSet<>();
        for (int year = 2025; year <= 2028; year++) {
            holidays.add(LocalDate.of(year, Month.JANUARY, 1));
            holidays.add(LocalDate.of(year, Month.JANUARY, 2));
            holidays.add(LocalDate.of(year, Month.JANUARY, 24));
            holidays.add(LocalDate.of(year, Month.MAY, 1));
            holidays.add(LocalDate.of(year, Month.JUNE, 1));
            holidays.add(LocalDate.of(year, Month.AUGUST, 15));
            holidays.add(LocalDate.of(year, Month.NOVEMBER, 30));
            holidays.add(LocalDate.of(year, Month.DECEMBER, 1));
            holidays.add(LocalDate.of(year, Month.DECEMBER, 25));
            holidays.add(LocalDate.of(year, Month.DECEMBER, 26));
        }
        // Orthodox Easter / Pentecost (moveable)
        holidays.add(LocalDate.of(2025, 4, 18));  // Good Friday
        holidays.add(LocalDate.of(2025, 4, 20));  // Easter Sunday
        holidays.add(LocalDate.of(2025, 4, 21));  // Easter Monday
        holidays.add(LocalDate.of(2025, 6, 8));   // Pentecost Sunday
        holidays.add(LocalDate.of(2025, 6, 9));   // Whit Monday
        holidays.add(LocalDate.of(2026, 4, 10));  // Good Friday
        holidays.add(LocalDate.of(2026, 4, 12));  // Easter Sunday
        holidays.add(LocalDate.of(2026, 4, 13));  // Easter Monday
        holidays.add(LocalDate.of(2026, 5, 31));  // Pentecost Sunday
        holidays.add(LocalDate.of(2026, 6, 1));   // Whit Monday
        holidays.add(LocalDate.of(2027, 4, 30));  // Good Friday
        holidays.add(LocalDate.of(2027, 5, 2));   // Easter Sunday
        holidays.add(LocalDate.of(2027, 5, 3));   // Easter Monday
        holidays.add(LocalDate.of(2027, 6, 20));  // Pentecost Sunday
        holidays.add(LocalDate.of(2027, 6, 21));  // Whit Monday
        return holidays;
    }
}