package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.InventoryItemDto;
import com.shv.Ecommerce.dto.InventorySummaryDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.Product;
import com.shv.Ecommerce.repository.ProductRepo;
import com.shv.Ecommerce.repository.PurchaseOrderRepo;
import com.shv.Ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepo productRepo;
    private final PurchaseOrderRepo purchaseOrderRepo;
    private final com.shv.Ecommerce.mapper.EntityDtoMapper entityDtoMapper;

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "inventorySummary")
    public Response getInventorySummary() {
        List<Product> products = productRepo.findAll();

        BigDecimal totalAssetValue = BigDecimal.ZERO;
        int inStockCount = 0;
        int lowStockCount = 0;
        int outOfStockCount = 0;

        for (Product p : products) {
            int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            int threshold = p.getLowStockThreshold() != null ? p.getLowStockThreshold() : 10;
            BigDecimal cost = p.getCostPrice() != null ? p.getCostPrice() : (p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO);

            totalAssetValue = totalAssetValue.add(cost.multiply(BigDecimal.valueOf(stock)));

            if (stock <= 0) {
                outOfStockCount++;
            } else if (stock <= threshold) {
                lowStockCount++;
            } else {
                inStockCount++;
            }
        }

        // Compute total incoming units across all active POs
        int totalIncoming = 0;
        List<Object[]> incomingList = purchaseOrderRepo.findIncomingQuantityByProduct();
        if (incomingList != null) {
            for (Object[] row : incomingList) {
                if (row.length > 1 && row[1] instanceof Number) {
                    totalIncoming += ((Number) row[1]).intValue();
                }
            }
        }

        InventorySummaryDto summary = new InventorySummaryDto();
        summary.setTotalAssetValue(totalAssetValue);
        summary.setTotalProducts(products.size());
        summary.setInStockCount(inStockCount);
        summary.setLowStockCount(lowStockCount);
        summary.setOutOfStockCount(outOfStockCount);
        summary.setTotalIncomingUnits(totalIncoming);

        return Response.builder()
                .status(200)
                .inventorySummary(summary)
                .build();
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "inventoryItems", key = "(#search != null ? #search : '') + '-' + (#status != null ? #status : '') + '-' + #page + '-' + #size")
    public Response getInventoryItems(String search, String status, Integer page, Integer size) {
        List<Product> products = productRepo.findAll();

        Map<Long, Integer> incomingMap = new HashMap<>();
        try {
            List<Object[]> incomingList = purchaseOrderRepo.findIncomingQuantityByProduct();
            if (incomingList != null) {
                for (Object[] row : incomingList) {
                    if (row != null && row.length > 1 && row[0] instanceof Number && row[1] instanceof Number) {
                        Long pId = ((Number) row[0]).longValue();
                        Integer qty = ((Number) row[1]).intValue();
                        incomingMap.put(pId, qty);
                    }
                }
            }
        } catch (Exception e) {
            // Graceful fallback
        }

        List<InventoryItemDto> filteredItems = products.stream().map(p -> {
            int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            int threshold = p.getLowStockThreshold() != null ? p.getLowStockThreshold() : 10;

            String itemStatus;
            if (stock <= 0) {
                itemStatus = "Out of stock";
            } else if (stock <= threshold) {
                itemStatus = "Low stock";
            } else {
                itemStatus = "In stock";
            }

            String prodSku = (p.getSku() != null && !p.getSku().isBlank()) ? p.getSku() : null;

            InventoryItemDto item = new InventoryItemDto();
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : "Uncategorized");
            item.setSku(prodSku);
            item.setIncomingQuantity(incomingMap.getOrDefault(p.getId(), 0));
            item.setAvailableStock(stock);
            item.setStatus(itemStatus);
            item.setPrice(p.getPrice());
            item.setCostPrice(p.getCostPrice() != null ? p.getCostPrice() : p.getPrice());
            item.setImageUrl(p.getImageUrl());
            if (p.getVariants() != null && !p.getVariants().isEmpty()) {
                item.setVariants(p.getVariants().stream().map(v -> {
                    com.shv.Ecommerce.dto.ProductVariantDto vDto = entityDtoMapper.mapProductVariantToDtoBasic(v);
                    if (v.getSku() != null && !v.getSku().isBlank()) {
                        vDto.setSku(v.getSku());
                    } else if (prodSku != null) {
                        vDto.setSku(prodSku + "-V" + v.getId());
                    } else {
                        vDto.setSku(null);
                    }
                    return vDto;
                }).toList());
            }
            return item;
        }).filter(item -> {
            if (search != null && !search.trim().isEmpty()) {
                String q = search.toLowerCase().trim();
                boolean matchName = item.getProductName() != null && item.getProductName().toLowerCase().contains(q);
                boolean matchSku = item.getSku() != null && item.getSku().toLowerCase().contains(q);
                boolean matchCat = item.getCategoryName() != null && item.getCategoryName().toLowerCase().contains(q);
                if (!matchName && !matchSku && !matchCat) return false;
            }
            if (status != null && !status.trim().isEmpty() 
                    && !"all".equalsIgnoreCase(status.trim()) 
                    && !"all statuses".equalsIgnoreCase(status.trim())) {
                if (!item.getStatus().equalsIgnoreCase(status.trim())) return false;
            }
            return true;
        }).toList();

        int pageNum = (page != null && page >= 0) ? page : 0;
        int pageSize = (size != null && size > 0) ? size : 20;

        int totalElements = filteredItems.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        if (totalPages < 1) totalPages = 1;

        if (pageNum >= totalPages && totalElements > 0) {
            pageNum = 0;
        }

        int fromIndex = Math.min(pageNum * pageSize, totalElements);
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        List<InventoryItemDto> pagedItems = filteredItems.subList(fromIndex, toIndex);

        return Response.builder()
                .status(200)
                .totalElement(totalElements)
                .totalPage(totalPages)
                .inventoryItemList(pagedItems)
                .build();
    }
}
