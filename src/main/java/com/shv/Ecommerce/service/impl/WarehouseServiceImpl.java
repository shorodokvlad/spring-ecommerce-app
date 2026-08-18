package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.WarehouseDto;
import com.shv.Ecommerce.dto.WarehouseStockDto;
import com.shv.Ecommerce.entity.Warehouse;
import com.shv.Ecommerce.entity.WarehouseStock;
import com.shv.Ecommerce.exception.NotFoundException;
import com.shv.Ecommerce.mapper.EntityDtoMapper;
import com.shv.Ecommerce.repository.WarehouseRepo;
import com.shv.Ecommerce.repository.WarehouseStockRepo;
import com.shv.Ecommerce.service.interf.IWarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements IWarehouseService {
    private final WarehouseRepo warehouseRepo;
    private final WarehouseStockRepo warehouseStockRepo;
    private final EntityDtoMapper entityDtoMapper;

    private void applyRequestFields(Warehouse warehouse, WarehouseDto request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            warehouse.setName(request.getName());
        }
        warehouse.setStreet(request.getStreet());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setZipCode(request.getZipCode());
        warehouse.setCountry(request.getCountry());
    }

    @Override
    public Response createWarehouse(WarehouseDto request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new com.shv.Ecommerce.exception.InvalidCredentialsException("Warehouse name is required");
        }

        Warehouse warehouse = new Warehouse();
        applyRequestFields(warehouse, request);
        warehouseRepo.save(warehouse);

        return Response.builder()
                .status(200)
                .message("Warehouse created successfully")
                .build();
    }

    @Override
    public Response updateWarehouse(Long warehouseId, WarehouseDto request) {
        Warehouse warehouse = warehouseRepo.findById(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found"));
        applyRequestFields(warehouse, request);
        warehouseRepo.save(warehouse);

        return Response.builder()
                .status(200)
                .message("Warehouse updated successfully")
                .build();
    }

    @Override
    @Transactional
    public Response deleteWarehouse(Long warehouseId) {
        Warehouse warehouse = warehouseRepo.findById(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found"));
        warehouseRepo.delete(warehouse);

        return Response.builder()
                .status(200)
                .message("Warehouse deleted successfully")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response getAllWarehouses() {
        List<Warehouse> warehouses = warehouseRepo.findAll();
        List<WarehouseDto> warehouseDtoList = warehouses.stream()
                .map(w -> {
                    WarehouseDto dto = entityDtoMapper.mapWarehouseToDtoBasic(w);
                    dto.setTotalStockQuantity(warehouseStockRepo.sumQuantityByWarehouseId(w.getId()));
                    return dto;
                })
                .toList();

        return Response.builder()
                .status(200)
                .warehouseList(warehouseDtoList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Response getWarehouseById(Long warehouseId) {
        Warehouse warehouse = warehouseRepo.findById(warehouseId)
                .orElseThrow(() -> new NotFoundException("Warehouse not found"));

        WarehouseDto warehouseDto = entityDtoMapper.mapWarehouseToDtoBasic(warehouse);
        warehouseDto.setTotalStockQuantity(warehouseStockRepo.sumQuantityByWarehouseId(warehouse.getId()));

        if (warehouse.getWarehouseStocks() != null && !warehouse.getWarehouseStocks().isEmpty()) {
            List<WarehouseStockDto> stockDtoList = new ArrayList<>();
            for (WarehouseStock stock : warehouse.getWarehouseStocks()) {
                if (stock.getQuantity() == null || stock.getQuantity() <= 0) continue;
                stockDtoList.add(entityDtoMapper.mapWarehouseStockToDtoBasic(stock));
            }
            warehouseDto.setWarehouseStocks(stockDtoList);
        }

        return Response.builder()
                .status(200)
                .warehouse(warehouseDto)
                .build();
    }
}