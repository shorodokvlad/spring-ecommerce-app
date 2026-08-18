package com.shv.Ecommerce.controller;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.service.interf.IDeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final IDeliveryService deliveryService;

    @GetMapping("/estimate")
    public ResponseEntity<Response> getEstimate(
            @RequestParam(required = false, defaultValue = "RO") String country,
            @RequestParam(required = false) String county,
            @RequestParam(required = false) String locality,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) BigDecimal subtotal
    ) {
        return ResponseEntity.ok(deliveryService.getEstimate(country, county, locality, source, subtotal));
    }

    @GetMapping("/counties")
    public ResponseEntity<Response> getCounties() {
        return ResponseEntity.ok(deliveryService.getCounties());
    }

    @GetMapping("/localities")
    public ResponseEntity<Response> getLocalities(@RequestParam String county) {
        return ResponseEntity.ok(deliveryService.getLocalities(county));
    }
}
