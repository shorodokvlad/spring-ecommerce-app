package com.shv.Ecommerce.controller;

import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.dto.ReviewRequest;
import com.shv.Ecommerce.exception.InvalidCredentialsException;
import com.shv.Ecommerce.security.AuthUser;
import com.shv.Ecommerce.service.interf.IReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {
    private final IReviewService reviewService;

    @GetMapping("/get-by-product-id/{productId}")
    public ResponseEntity<Response> getReviewsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @PostMapping("/create/{productId}")
    public ResponseEntity<Response> createReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        if (authUser == null) {
            throw new InvalidCredentialsException("You must be logged in to review a product");
        }
        return ResponseEntity.ok(reviewService.createReview(productId, request.getRating(), request.getContent(), authUser.getUser()));
    }

    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<Response> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal AuthUser authUser
    ) {
        if (authUser == null) {
            throw new InvalidCredentialsException("You must be logged in to delete a review");
        }
        return ResponseEntity.ok(reviewService.deleteReview(reviewId, authUser.getUser()));
    }
}