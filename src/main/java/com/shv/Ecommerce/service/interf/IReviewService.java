package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.User;

public interface IReviewService {
    Response getReviewsByProductId(Long productId);
    Response createReview(Long productId, Integer rating, String content, User user);
    Response deleteReview(Long reviewId, User user);
}