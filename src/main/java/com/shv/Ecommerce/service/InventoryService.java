package com.shv.Ecommerce.service;

import com.shv.Ecommerce.dto.Response;

public interface InventoryService {
    Response getInventorySummary();
    Response getInventoryItems(String search, String status, Integer page, Integer size);
}
