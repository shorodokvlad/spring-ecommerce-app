package com.shv.Ecommerce.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer rating;
    private String content;
}