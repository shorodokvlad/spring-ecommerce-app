package com.shv.Ecommerce.service;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.SupplierDto;

public interface SupplierService {
    Response createSupplier(SupplierDto supplierDto);
    Response updateSupplier(Long id, SupplierDto supplierDto);
    Response getAllSuppliers();
    Response getSupplierById(Long id);
    Response deleteSupplier(Long id);
}
