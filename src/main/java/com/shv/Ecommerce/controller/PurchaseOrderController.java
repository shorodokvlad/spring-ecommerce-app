package com.shv.Ecommerce.controller;

import com.shv.Ecommerce.dto.PurchaseOrderDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> createPurchaseOrder(@RequestBody PurchaseOrderDto poDto) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(poDto));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_RESTRICTED', 'MANAGER')")
    public ResponseEntity<Response> getAllPurchaseOrders(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_RESTRICTED', 'MANAGER')")
    public ResponseEntity<Response> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> receiveStock(@PathVariable Long id, @RequestBody Map<Long, Integer> itemReceivedQuantities) {
        return ResponseEntity.ok(purchaseOrderService.receiveStock(id, itemReceivedQuantities));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> cancelPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.cancelPurchaseOrder(id));
    }
}
