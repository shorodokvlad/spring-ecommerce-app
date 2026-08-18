package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.WarehouseDto;

public interface IWarehouseService {
    Response createWarehouse(WarehouseDto request);
    Response updateWarehouse(Long warehouseId, WarehouseDto request);
    Response deleteWarehouse(Long warehouseId);
    Response getAllWarehouses();
    Response getWarehouseById(Long warehouseId);
}