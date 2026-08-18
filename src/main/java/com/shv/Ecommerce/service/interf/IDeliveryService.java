package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;

import java.math.BigDecimal;

public interface IDeliveryService {

    Response getEstimate(String country, String county, String locality, String source, BigDecimal subtotal);

    Response getCounties();

    Response getLocalities(String county);
}
