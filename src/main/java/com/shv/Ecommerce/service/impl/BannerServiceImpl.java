package com.shv.Ecommerce.service.impl;

import com.shv.Ecommerce.dto.BannerDto;
import com.shv.Ecommerce.dto.Response;
import com.shv.Ecommerce.entity.Banner;
import com.shv.Ecommerce.exception.NotFoundException;
import com.shv.Ecommerce.mapper.EntityDtoMapper;
import com.shv.Ecommerce.repository.BannerRepo;
import com.shv.Ecommerce.service.AwsS3Service;
import com.shv.Ecommerce.service.interf.IBannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BannerServiceImpl implements IBannerService {
    private final BannerRepo bannerRepo;
    private final EntityDtoMapper entityDtoMapper;
    private final AwsS3Service awsS3Service;

    @Override
    @CacheEvict(cacheNames = "banners", allEntries = true)
    public Response createBanner(MultipartFile image, String imageUrl, String title, String linkUrl, Boolean active, Integer displayOrder) {
        String finalImageUrl = imageUrl;
        if (image != null && !image.isEmpty()) {
            finalImageUrl = awsS3Service.saveImageToS3(image);
        }

        if (finalImageUrl == null || finalImageUrl.isBlank()) {
            return Response.builder()
                    .status(400)
                    .message("Banner image is required (either upload file or provide image URL)")
                    .build();
        }

        Banner banner = Banner.builder()
                .title(title)
                .linkUrl(linkUrl)
                .imageUrl(finalImageUrl)
                .active(active != null ? active : true)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        bannerRepo.save(banner);

        return Response.builder()
                .status(200)
                .message("Banner created successfully")
                .banner(entityDtoMapper.mapBannerToDtoBasic(banner))
                .build();
    }

    @Override
    @CacheEvict(cacheNames = "banners", allEntries = true)
    public Response updateBanner(Long bannerId, MultipartFile image, String imageUrl, String title, String linkUrl, Boolean active, Integer displayOrder) {
        Banner banner = bannerRepo.findById(bannerId)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        if (image != null && !image.isEmpty()) {
            banner.setImageUrl(awsS3Service.saveImageToS3(image));
        } else if (imageUrl != null && !imageUrl.isBlank()) {
            banner.setImageUrl(imageUrl);
        }

        if (title != null) banner.setTitle(title);
        if (linkUrl != null) banner.setLinkUrl(linkUrl);
        if (active != null) banner.setActive(active);
        if (displayOrder != null) banner.setDisplayOrder(displayOrder);

        bannerRepo.save(banner);

        return Response.builder()
                .status(200)
                .message("Banner updated successfully")
                .banner(entityDtoMapper.mapBannerToDtoBasic(banner))
                .build();
    }

    @Override
    @CacheEvict(cacheNames = "banners", allEntries = true)
    public Response deleteBanner(Long bannerId) {
        Banner banner = bannerRepo.findById(bannerId)
                .orElseThrow(() -> new NotFoundException("Banner not found"));
        bannerRepo.delete(banner);

        return Response.builder()
                .status(200)
                .message("Banner deleted successfully")
                .build();
    }

    @Override
    @Cacheable(cacheNames = "banners", key = "#bannerId")
    public Response getBannerById(Long bannerId) {
        Banner banner = bannerRepo.findById(bannerId)
                .orElseThrow(() -> new NotFoundException("Banner not found"));

        return Response.builder()
                .status(200)
                .banner(entityDtoMapper.mapBannerToDtoBasic(banner))
                .build();
    }

    @jakarta.annotation.PostConstruct
    public void cleanDefaultBanners() {
        List<Banner> defaultBanners = bannerRepo.findAll().stream()
                .filter(b -> b.getImageUrl() != null && b.getImageUrl().startsWith("/banners/"))
                .collect(Collectors.toList());
        if (!defaultBanners.isEmpty()) {
            bannerRepo.deleteAll(defaultBanners);
            log.info("Cleaned up {} legacy default banners from database", defaultBanners.size());
        }
    }

    @Override
    @Cacheable(cacheNames = "banners")
    public Response getAllBanners() {
        List<Banner> banners = bannerRepo.findAllByOrderByDisplayOrderAsc();
        List<BannerDto> bannerDtos = banners.stream()
                .map(entityDtoMapper::mapBannerToDtoBasic)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .bannerList(bannerDtos)
                .build();
    }

    @Override
    @Cacheable(cacheNames = "banners")
    public Response getActiveBanners() {
        List<Banner> banners = bannerRepo.findByActiveTrueOrderByDisplayOrderAsc();
        List<BannerDto> bannerDtos = banners.stream()
                .map(entityDtoMapper::mapBannerToDtoBasic)
                .collect(Collectors.toList());

        return Response.builder()
                .status(200)
                .bannerList(bannerDtos)
                .build();
    }
}
