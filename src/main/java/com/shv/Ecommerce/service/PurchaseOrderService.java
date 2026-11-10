package com.shv.Ecommerce.service;

import com.shv.Ecommerce.dto.PurchaseOrderDto;
import com.shv.Ecommerce.dto.Response;

import java.util.Map;

public interface PurchaseOrderService {
    Response createPurchaseOrder(PurchaseOrderDto poDto);
    Response getAllPurchaseOrders(Integer page, Integer size);
    Response getPurchaseOrderById(Long id);
    Response receiveStock(Long poId, Map<Long, Integer> itemReceivedQuantities);
    Response cancelPurchaseOrder(Long id);
}
