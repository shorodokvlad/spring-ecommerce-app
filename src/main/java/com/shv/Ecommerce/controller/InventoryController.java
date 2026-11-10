package com.shv.Ecommerce.controller;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_RESTRICTED', 'MANAGER')")
    public ResponseEntity<Response> getInventorySummary() {
        return ResponseEntity.ok(inventoryService.getInventorySummary());
    }

    @GetMapping("/items")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_RESTRICTED', 'MANAGER')")
    public ResponseEntity<Response> getInventoryItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        return ResponseEntity.ok(inventoryService.getInventoryItems(search, status, page, size));
    }
}
