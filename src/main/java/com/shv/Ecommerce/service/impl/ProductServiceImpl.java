package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.ProductDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.Category;
import com.shv.Ecommerce.entity.Product;
import com.shv.Ecommerce.entity.Review;
import com.shv.Ecommerce.entity.Warehouse;
import com.shv.Ecommerce.entity.WarehouseStock;
import com.shv.Ecommerce.exception.NotFoundException;
import com.shv.Ecommerce.mapper.EntityDtoMapper;
import com.shv.Ecommerce.repository.CategoryRepo;
import com.shv.Ecommerce.repository.ProductRepo;
import com.shv.Ecommerce.repository.ReviewRepo;
import com.shv.Ecommerce.repository.WarehouseRepo;
import com.shv.Ecommerce.service.AwsS3Service;
import com.shv.Ecommerce.service.interf.IProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductServiceImpl implements IProductService {
    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;
    private final EntityDtoMapper entityDtoMapper;
    private final AwsS3Service awsS3Service;
    private final ReviewRepo reviewRepo;
    private final WarehouseRepo warehouseRepo;

    private ProductDto mapProductToDtoWithReviewStats(Product product) {
        ProductDto productDto = entityDtoMapper.mapProductToDtoBasic(product);

        List<Review> reviews = reviewRepo.findByProductId(product.getId());
        if (reviews.isEmpty()) {
            productDto.setReviewCount(0);
        } else {
            productDto.setReviewCount(reviews.size());
            double average = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0);
            productDto.setAverageRating(BigDecimal.valueOf(average).setScale(1, RoundingMode.HALF_UP));
        }

        return productDto;
    }
    @Override
    public Response createProduct(Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity) {
        return createProduct(categoryId, image, null, name, description, price, stockQuantity);
    }

    @Override
    public Response createProduct(Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity) {
        return createProduct(categoryId, image, images, name, description, price, stockQuantity, null, null);
    }

    public Response createProduct(Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, String variantsJson) {
        return createProduct(categoryId, image, images, name, description, price, stockQuantity, variantsJson, null);
    }

    @Override
    public Response createProduct(Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, String variantsJson, Map<Integer, List<MultipartFile>> variantImagesMap) {
        Category category = categoryRepo.findById(categoryId).orElseThrow(() -> new NotFoundException("Category not found"));

        List<String> uploadedImageUrls = new ArrayList<>();
        if (image != null && !image.isEmpty()) {
            uploadedImageUrls.add(awsS3Service.saveImageToS3(image));
        }
        if (images != null && !images.isEmpty()) {
            uploadedImageUrls.addAll(awsS3Service.saveImagesToS3(images));
        }

        Product product = new Product();
        product.setCategory(category);
        product.setPrice(price);
        product.setName(name);
        product.setDescription(description);
        if (!uploadedImageUrls.isEmpty()) {
            product.setImageUrl(uploadedImageUrls.get(0));
            product.setImageUrls(uploadedImageUrls);
        }
        product.setStockQuantity(stockQuantity != null ? stockQuantity : 0);

        processVariantsJson(product, variantsJson, variantImagesMap);

        productRepo.save(product);

        return Response.builder()
                .status(200)
                .message("Product successfully created")
                .build();
    }

    @Override
    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, String name, String description, BigDecimal price, Integer stockQuantity) {
        return updateProduct(productId, categoryId, image, null, name, description, price, stockQuantity, null, null, null);
    }

    @Override
    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, List<String> existingImageUrls) {
        return updateProduct(productId, categoryId, image, images, name, description, price, stockQuantity, existingImageUrls, null, null);
    }

    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, List<String> existingImageUrls, String variantsJson) {
        return updateProduct(productId, categoryId, image, images, name, description, price, stockQuantity, existingImageUrls, variantsJson, null);
    }

    @Override
    public Response updateProduct(Long productId, Long categoryId, MultipartFile image, List<MultipartFile> images, String name, String description, BigDecimal price, Integer stockQuantity, List<String> existingImageUrls, String variantsJson, Map<Integer, List<MultipartFile>> variantImagesMap) {
        Product product = productRepo.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Category category = null;
        if (categoryId != null) {
            category = categoryRepo.findById(categoryId).orElseThrow(() -> new NotFoundException("Category not found"));
        }

        List<String> finalImageUrls = new ArrayList<>();
        if (existingImageUrls != null) {
            finalImageUrls.addAll(existingImageUrls);
        } else if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            finalImageUrls.addAll(product.getImageUrls());
        }

        if (image != null && !image.isEmpty()) {
            String primaryUrl = awsS3Service.saveImageToS3(image);
            if (!finalImageUrls.contains(primaryUrl)) {
                finalImageUrls.add(0, primaryUrl);
            }
        }

        if (images != null && !images.isEmpty()) {
            List<String> newUrls = awsS3Service.saveImagesToS3(images);
            for (String url : newUrls) {
                if (!finalImageUrls.contains(url)) {
                    finalImageUrls.add(url);
                }
            }
        }

        if (category != null) product.setCategory(category);
        if (name != null) product.setName(name);
        if (price != null) product.setPrice(price);
        if (description != null) product.setDescription(description);
        if (stockQuantity != null) product.setStockQuantity(stockQuantity);

        if (!finalImageUrls.isEmpty()) {
            product.setImageUrl(finalImageUrls.get(0));
            product.setImageUrls(finalImageUrls);
        }

        if (variantsJson != null) {
            processVariantsJson(product, variantsJson, variantImagesMap);
        }

        productRepo.save(product);
        return Response.builder()
                .status(200)
                .message("Product updated successfully")
                .build();
    }

    private void processVariantsJson(Product product, String variantsJson, Map<Integer, List<MultipartFile>> variantImagesMap) {
        if (variantsJson != null && !variantsJson.isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<com.shv.Ecommerce.dto.ProductVariantDto> vDtos = mapper.readValue(
                        variantsJson,
                        new com.fasterxml.jackson.core.type.TypeReference<List<com.shv.Ecommerce.dto.ProductVariantDto>>() {}
                );
                product.getVariants().clear();
                int totalStock = 0;
                for (int i = 0; i < vDtos.size(); i++) {
                    com.shv.Ecommerce.dto.ProductVariantDto dto = vDtos.get(i);
                    com.shv.Ecommerce.entity.ProductVariant variant = new com.shv.Ecommerce.entity.ProductVariant();
                    variant.setTitle(dto.getTitle());
                    if (dto.getAttributes() != null) {
                        variant.setAttributes(new HashMap<>(dto.getAttributes()));
                    }
                    variant.setPrice(dto.getPrice());

                    int vStock = 0;
                    List<WarehouseStock> warehouseStocks = new ArrayList<>();
                    if (dto.getStockByWarehouse() != null && !dto.getStockByWarehouse().isEmpty()) {
                        for (com.shv.Ecommerce.dto.WarehouseStockDto stockDto : dto.getStockByWarehouse()) {
                            if (stockDto.getWarehouseId() == null || stockDto.getQuantity() == null || stockDto.getQuantity() <= 0) {
                                continue;
                            }
                            Warehouse warehouse = warehouseRepo.findById(stockDto.getWarehouseId())
                                    .orElseThrow(() -> new NotFoundException("Warehouse not found"));
                            WarehouseStock warehouseStock = new WarehouseStock();
                            warehouseStock.setWarehouse(warehouse);
                            warehouseStock.setVariant(variant);
                            warehouseStock.setQuantity(stockDto.getQuantity());
                            warehouseStocks.add(warehouseStock);
                            vStock += stockDto.getQuantity();
                        }
                    }
                    variant.setWarehouseStocks(warehouseStocks);
                    if (vStock == 0 && dto.getStockQuantity() != null && dto.getStockQuantity() > 0) {
                        vStock = dto.getStockQuantity();
                    }
                    variant.setStockQuantity(vStock);
                    totalStock += vStock;

                    List<String> variantUrls = new ArrayList<>();
                    if (dto.getImageUrls() != null) {
                        variantUrls.addAll(dto.getImageUrls());
                    }
                    if (variantImagesMap != null && variantImagesMap.containsKey(i)) {
                        List<MultipartFile> vFiles = variantImagesMap.get(i);
                        if (vFiles != null && !vFiles.isEmpty()) {
                            variantUrls.addAll(awsS3Service.saveImagesToS3(vFiles));
                        }
                    }
                    variant.setImageUrls(variantUrls);
                    variant.setProduct(product);
                    product.getVariants().add(variant);
                }

                if (!product.getVariants().isEmpty()) {
                    product.setStockQuantity(totalStock);
                    com.shv.Ecommerce.entity.ProductVariant firstVariant = product.getVariants().get(0);
                    if (firstVariant.getPrice() != null) {
                        product.setPrice(firstVariant.getPrice());
                    }
                    if (firstVariant.getImageUrls() != null && !firstVariant.getImageUrls().isEmpty()) {
                        product.setImageUrl(firstVariant.getImageUrls().get(0));
                        product.setImageUrls(new ArrayList<>(firstVariant.getImageUrls()));
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing variantsJson", e);
            }
        }
    }

    @Override
    public Response deleteProduct(Long productId) {
        Product product = productRepo.findById(productId).orElseThrow(()->new RuntimeException("Product not found"));
        productRepo.delete(product);

        return Response.builder()
                .status(200)
                .message("Product was deleted successfully ")
                .build();
    }

    @Override
    public Response getProductById(Long productId) {
        Product product = productRepo.findById(productId).orElseThrow(()->new RuntimeException("Product not found"));
        ProductDto productDto = mapProductToDtoWithReviewStats(product);

        return Response.builder()
                .status(200)
                .product(productDto)
                .build();
    }

    @Override
    public Response getAllProducts() {
        return getAllProducts(null, null);
    }

    @Override
    public Response getAllProducts(Integer page, Integer size) {
        if (page != null && size != null && page >= 0 && size > 0) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
            Page<Product> productPage = productRepo.findAll(pageable);
            List<ProductDto> productDtoList = productPage.getContent()
                    .stream()
                    .map(this::mapProductToDtoWithReviewStats)
                    .toList();

            return Response.builder()
                    .status(200)
                    .totalPage(productPage.getTotalPages())
                    .totalElement((int) productPage.getTotalElements())
                    .productList(productDtoList)
                    .build();
        }

        List<ProductDto> productList = productRepo.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(this::mapProductToDtoWithReviewStats)
                .toList();

        return Response.builder()
                .status(200)
                .totalPage(1)
                .totalElement(productList.size())
                .productList(productList)
                .build();
    }

    @Override
    public Response getProductByCategory(Long categoryId) {
        return getProductByCategory(categoryId, null, null);
    }

    @Override
    public Response getProductByCategory(Long categoryId, Integer page, Integer size) {
        if (page != null && size != null && page >= 0 && size > 0) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
            Page<Product> productPage = productRepo.findByCategoryId(categoryId, pageable);

            if (productPage.isEmpty()) {
                throw new NotFoundException("No Products found for this category");
            }

            List<ProductDto> productDtoList = productPage.getContent().stream()
                    .map(this::mapProductToDtoWithReviewStats)
                    .toList();

            return Response.builder()
                    .status(200)
                    .totalPage(productPage.getTotalPages())
                    .totalElement((int) productPage.getTotalElements())
                    .productList(productDtoList)
                    .build();
        }

        List<Product> products = productRepo.findByCategoryId(categoryId);

        if (products.isEmpty()) {
            throw new NotFoundException("No Products found for this category");
        }

        List<ProductDto> productDtoList = products.stream()
                .map(this::mapProductToDtoWithReviewStats)
                .toList();

        return Response.builder()
                .status(200)
                .totalPage(1)
                .totalElement(productDtoList.size())
                .productList(productDtoList)
                .build();
    }

    @Override
    public Response searchProduct(String searchValue) {
        return searchProduct(searchValue, null, null);
    }

    @Override
    public Response searchProduct(String searchValue, Integer page, Integer size) {
        String query = (searchValue != null) ? searchValue.trim() : "";

        if (page != null && size != null && page >= 0 && size > 0) {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
            Page<Product> productPage = productRepo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query, pageable);

            if (productPage.isEmpty()) {
                return Response.builder()
                        .status(200)
                        .message("No products found")
                        .totalPage(0)
                        .totalElement(0)
                        .productList(java.util.Collections.emptyList())
                        .build();
            }

            List<ProductDto> productDtoList = productPage.getContent().stream()
                    .map(this::mapProductToDtoWithReviewStats)
                    .toList();

            return Response.builder()
                    .status(200)
                    .totalPage(productPage.getTotalPages())
                    .totalElement((int) productPage.getTotalElements())
                    .productList(productDtoList)
                    .build();
        }

        List<Product> products = productRepo.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);

        if (products.isEmpty()) {
            return Response.builder()
                    .status(200)
                    .message("No products found")
                    .totalPage(0)
                    .totalElement(0)
                    .productList(java.util.Collections.emptyList())
                    .build();
        }

        List<ProductDto> productDtoList = products.stream()
                .map(this::mapProductToDtoWithReviewStats)
                .toList();

        return Response.builder()
                .status(200)
                .totalPage(1)
                .totalElement(productDtoList.size())
                .productList(productDtoList)
                .build();
    }
}
