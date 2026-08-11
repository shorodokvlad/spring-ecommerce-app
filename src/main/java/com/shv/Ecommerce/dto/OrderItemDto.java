package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class  OrderItemDto {
    private Long id;
    private int quantity;
    private BigDecimal price;
    private String status;
    private Long variantId;
    private String variantTitle;
    private String variantImageUrl;
    private Map<String, String> variantAttributes;
    private UserDto userDto;
    private ProductDto productDto;

    private LocalDateTime createdAt;
}
