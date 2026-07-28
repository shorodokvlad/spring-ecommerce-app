package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface IProductService {
    Response createProduct(Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity);
    Response createProduct(Long categoryId, MultipartFile image, java.util.List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity);

    Response updateProduct(Long productId, Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity);
    Response updateProduct(Long productId, Long categoryId, MultipartFile image, java.util.List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, java.util.List<String> existingImageUrls);

    Response deleteProduct(Long productId);

    Response getProductById(Long productId);

    Response getAllProducts();
    Response getAllProducts(Integer page, Integer size);

    Response getProductByCategory(Long categoryId);
    Response getProductByCategory(Long categoryId, Integer page, Integer size);

    Response searchProduct(String searchValue);
    Response searchProduct(String searchValue, Integer page, Integer size);
}
