package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.SupplierDto;
import com.shv.Ecommerce.entity.Supplier;
import com.shv.Ecommerce.repository.SupplierRepo;
import com.shv.Ecommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepo supplierRepo;

    private SupplierDto mapToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setNotes(supplier.getNotes());
        dto.setCreatedAt(supplier.getCreatedAt());
        return dto;
    }

    @Override
    @org.springframework.cache.annotation.CacheEvict(value = {"suppliers"}, allEntries = true)
    public Response createSupplier(SupplierDto supplierDto) {
        Supplier supplier = new Supplier();
        supplier.setName(supplierDto.getName());
        supplier.setEmail(supplierDto.getEmail());
        supplier.setPhone(supplierDto.getPhone());
        supplier.setAddress(supplierDto.getAddress());
        supplier.setContactPerson(supplierDto.getContactPerson());
        supplier.setNotes(supplierDto.getNotes());

        Supplier saved = supplierRepo.save(supplier);

        return Response.builder()
                .status(200)
                .message("Supplier created successfully")
                .supplier(mapToDto(saved))
                .build();
    }

    @Override
    @org.springframework.cache.annotation.CacheEvict(value = {"suppliers"}, allEntries = true)
    public Response updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        if (supplierDto.getName() != null) supplier.setName(supplierDto.getName());
        if (supplierDto.getEmail() != null) supplier.setEmail(supplierDto.getEmail());
        if (supplierDto.getPhone() != null) supplier.setPhone(supplierDto.getPhone());
        if (supplierDto.getAddress() != null) supplier.setAddress(supplierDto.getAddress());
        if (supplierDto.getContactPerson() != null) supplier.setContactPerson(supplierDto.getContactPerson());
        if (supplierDto.getNotes() != null) supplier.setNotes(supplierDto.getNotes());

        Supplier updated = supplierRepo.save(supplier);

        return Response.builder()
                .status(200)
                .message("Supplier updated successfully")
                .supplier(mapToDto(updated))
                .build();
    }

    @Override
    @org.springframework.cache.annotation.Cacheable(value = "suppliers")
    public Response getAllSuppliers() {
        List<SupplierDto> list = supplierRepo.findAll().stream()
                .map(this::mapToDto)
                .toList();

        return Response.builder()
                .status(200)
                .supplierList(list)
                .build();
    }

    @Override
    public Response getSupplierById(Long id) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        return Response.builder()
                .status(200)
                .supplier(mapToDto(supplier))
                .build();
    }

    @Override
    @org.springframework.cache.annotation.CacheEvict(value = {"suppliers"}, allEntries = true)
    public Response deleteSupplier(Long id) {
        Supplier supplier = supplierRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        supplierRepo.delete(supplier);

        return Response.builder()
                .status(200)
                .message("Supplier deleted successfully")
                .build();
    }
}
