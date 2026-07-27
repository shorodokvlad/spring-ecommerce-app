package com.shv.Ecommerce.service.interf;

import com.shv.Ecommerce.dto.Response;
import org.springframework.web.multipart.MultipartFile;

public interface IBannerService {
    Response createBanner(MultipartFile image, String imageUrl, String title, String linkUrl, Boolean active, Integer displayOrder);
    Response updateBanner(Long bannerId, MultipartFile image, String imageUrl, String title, String linkUrl, Boolean active, Integer displayOrder);
    Response deleteBanner(Long bannerId);
    Response getBannerById(Long bannerId);
    Response getAllBanners();
    Response getActiveBanners();
}
