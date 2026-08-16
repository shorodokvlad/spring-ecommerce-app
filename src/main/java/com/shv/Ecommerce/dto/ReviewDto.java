package com.shv.Ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private String content;
    private Integer rating;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
}