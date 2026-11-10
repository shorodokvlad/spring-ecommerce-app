package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.PurchaseOrderDto;
import com.shv.Ecommerce.dto.PurchaseOrderItemDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.*;
import com.shv.Ecommerce.repository.*;
import com.shv.Ecommerce.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepo purchaseOrderRepo;
    private final SupplierRepo supplierRepo;
    private final WarehouseRepo warehouseRepo;
    private final ProductRepo productRepo;
    private final ProductVariantRepo variantRepo;
    private final WarehouseStockRepo warehouseStockRepo;
    private final InventoryTransactionRepo transactionRepo;

    private PurchaseOrderDto mapToDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setPoNumber(po.getPoNumber());
        if (po.getSupplier() != null) {
            dto.setSupplierId(po.getSupplier().getId());
            dto.setSupplierName(po.getSupplier().getName());
        }
        if (po.getWarehouse() != null) {
            dto.setWarehouseId(po.getWarehouse().getId());
            dto.setWarehouseName(po.getWarehouse().getName());
        }
        dto.setStatus(po.getStatus());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setTotalCostAmount(po.getTotalCostAmount());
        dto.setNotes(po.getNotes());
        dto.setCreatedAt(po.getCreatedAt());

        if (po.getItems() != null) {
            List<PurchaseOrderItemDto> itemDtos = po.getItems().stream().map(item -> {
                PurchaseOrderItemDto itemDto = new PurchaseOrderItemDto();
                itemDto.setId(item.getId());
                if (item.getProduct() != null) {
                    itemDto.setProductId(item.getProduct().getId());
                    itemDto.setProductName(item.getProduct().getName());
                    itemDto.setProductSku(item.getProduct().getSku());
                    itemDto.setProductImageUrl(item.getProduct().getImageUrl());
                }
                if (item.getVariant() != null) {
                    itemDto.setVariantId(item.getVariant().getId());
                    itemDto.setVariantTitle(item.getVariant().getTitle());
                }
                itemDto.setOrderedQuantity(item.getOrderedQuantity());
                itemDto.setReceivedQuantity(item.getReceivedQuantity());
                itemDto.setUnitCostPrice(item.getUnitCostPrice());
                return itemDto;
            }).toList();
            dto.setItems(itemDtos);
        }

        return dto;
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"purchaseOrders", "inventorySummary", "inventoryItems", "products"}, allEntries = true)
    public Response createPurchaseOrder(PurchaseOrderDto poDto) {
        Supplier supplier = supplierRepo.findById(poDto.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        Warehouse warehouse = warehouseRepo.findById(poDto.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setStatus("ORDERED");
        po.setExpectedDeliveryDate(poDto.getExpectedDeliveryDate());
        po.setNotes(poDto.getNotes());

        BigDecimal totalCost = BigDecimal.ZERO;
        List<PurchaseOrderItem> items = new ArrayList<>();

        if (poDto.getItems() != null) {
            for (PurchaseOrderItemDto itemDto : poDto.getItems()) {
                Product product = productRepo.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found ID: " + itemDto.getProductId()));

                ProductVariant variant = null;
                if (itemDto.getVariantId() != null) {
                    variant = variantRepo.findById(itemDto.getVariantId()).orElse(null);
                }

                PurchaseOrderItem item = new PurchaseOrderItem();
                item.setPurchaseOrder(po);
                item.setProduct(product);
                item.setVariant(variant);
                item.setOrderedQuantity(itemDto.getOrderedQuantity() != null ? itemDto.getOrderedQuantity() : 0);
                item.setReceivedQuantity(0);

                BigDecimal unitCost = itemDto.getUnitCostPrice() != null ? itemDto.getUnitCostPrice() : 
                        (product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO);
                item.setUnitCostPrice(unitCost);

                BigDecimal lineTotal = unitCost.multiply(BigDecimal.valueOf(item.getOrderedQuantity()));
                totalCost = totalCost.add(lineTotal);

                items.add(item);
            }
        }

        po.setTotalCostAmount(totalCost);
        po.setItems(items);

        PurchaseOrder savedPo = purchaseOrderRepo.save(po);

        return Response.builder()
                .status(200)
                .message("Purchase order created successfully")
                .purchaseOrder(mapToDto(savedPo))
                .build();
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "purchaseOrders", key = "#page + '-' + #size")
    public Response getAllPurchaseOrders(Integer page, Integer size) {
        List<PurchaseOrderDto> allOrders = purchaseOrderRepo.findAll().stream()
                .map(this::mapToDto)
                .toList();

        int pageNum = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 20;

        int totalElements = allOrders.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (pageNum >= totalPages && totalElements > 0) {
            pageNum = 0;
        }

        int fromIndex = Math.min(pageNum * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<PurchaseOrderDto> pagedOrders = allOrders.subList(fromIndex, toIndex);

        return Response.builder()
                .status(200)
                .totalElement(totalElements)
                .totalPage(totalPages)
                .purchaseOrderList(pagedOrders)
                .build();
    }

    @Override
    public Response getPurchaseOrderById(Long id) {
        PurchaseOrder po = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        return Response.builder()
                .status(200)
                .purchaseOrder(mapToDto(po))
                .build();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"purchaseOrders", "inventorySummary", "inventoryItems", "products"}, allEntries = true)
    public Response receiveStock(Long poId, Map<Long, Integer> itemReceivedQuantities) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        boolean allReceived = true;
        boolean anyReceived = false;

        for (PurchaseOrderItem item : po.getItems()) {
            Integer newlyReceived = itemReceivedQuantities != null ? itemReceivedQuantities.get(item.getId()) : 0;
            if (newlyReceived != null && newlyReceived > 0) {
                anyReceived = true;
                item.setReceivedQuantity(item.getReceivedQuantity() + newlyReceived);

                Product product = item.getProduct();
                if (product != null) {
                    // 1. Update product base stock
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    product.setStockQuantity(currentStock + newlyReceived);

                    // Update cost price if specified
                    if (item.getUnitCostPrice() != null && item.getUnitCostPrice().compareTo(BigDecimal.ZERO) > 0) {
                        product.setCostPrice(item.getUnitCostPrice());
                    }
                    productRepo.save(product);

                    // 2. Update variant stock if variant exists
                    ProductVariant variant = item.getVariant();
                    if (variant != null) {
                        int vStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                        variant.setStockQuantity(vStock + newlyReceived);
                        variantRepo.save(variant);
                    }

                    // 3. Update WarehouseStock
                    Warehouse warehouse = po.getWarehouse();
                    if (warehouse != null) {
                        WarehouseStock ws = null;
                        if (variant != null) {
                            ws = warehouseStockRepo.findByWarehouseIdAndVariantId(warehouse.getId(), variant.getId()).orElse(null);
                        }
                        if (ws == null) {
                            ws = new WarehouseStock();
                            ws.setWarehouse(warehouse);
                            ws.setVariant(variant);
                            ws.setQuantity(newlyReceived);
                        } else {
                            ws.setQuantity((ws.getQuantity() != null ? ws.getQuantity() : 0) + newlyReceived);
                        }
                        warehouseStockRepo.save(ws);
                    }

                    // 4. Create InventoryTransaction record
                    InventoryTransaction tx = new InventoryTransaction();
                    tx.setProduct(product);
                    tx.setVariant(variant);
                    tx.setWarehouse(po.getWarehouse());
                    tx.setType("PURCHASE_RECEIPT");
                    tx.setQuantityChange(newlyReceived);
                    tx.setUnitCostPrice(item.getUnitCostPrice());
                    tx.setReferenceId(po.getPoNumber());
                    transactionRepo.save(tx);
                }
            }

            if (item.getReceivedQuantity() < item.getOrderedQuantity()) {
                allReceived = false;
            }
        }

        if (allReceived) {
            po.setStatus("RECEIVED");
        } else if (anyReceived) {
            po.setStatus("PARTIALLY_RECEIVED");
        }

        PurchaseOrder updated = purchaseOrderRepo.save(po);

        return Response.builder()
                .status(200)
                .message("Stock received successfully")
                .purchaseOrder(mapToDto(updated))
                .build();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"purchaseOrders", "inventorySummary", "inventoryItems"}, allEntries = true)
    public Response cancelPurchaseOrder(Long id) {
        PurchaseOrder po = purchaseOrderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Purchase Order not found"));

        po.setStatus("CANCELLED");
        PurchaseOrder updated = purchaseOrderRepo.save(po);

        return Response.builder()
                .status(200)
                .message("Purchase Order cancelled")
                .purchaseOrder(mapToDto(updated))
                .build();
    }
}
