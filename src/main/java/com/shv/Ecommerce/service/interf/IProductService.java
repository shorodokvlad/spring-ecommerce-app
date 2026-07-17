package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface IProductService {
    Response createProduct(Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity);

    Response updateProduct(Long productId, Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity);

    Response deleteProduct(Long productId);

    Response getProductById(Long productId);

    Response getAllProducts();

    Response getProductByCategory(Long productId);

    Response searchProduct(String searchValue);

}
