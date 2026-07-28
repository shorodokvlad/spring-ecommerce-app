import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import "../../style/bannerCarousel.css";

const CACHE_KEY = "shv_home_banners";
const CACHE_TIME_KEY = "shv_home_banners_time";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        // Read cached banners from sessionStorage for instant render
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime, 10)) < CACHE_TTL) {
            try {
                const parsed = JSON.parse(cachedData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setBanners(parsed);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        fetchActiveBanners();
    }, []);

    const fetchActiveBanners = async () => {
        try {
            const res = await ApiService.getActiveBanners();
            const fetched = (res.bannerList && res.bannerList.length > 0) ? res.bannerList : [];
            setBanners(fetched);
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetched));
            sessionStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
        } catch (err) {
            if (!sessionStorage.getItem(CACHE_KEY)) {
                setBanners([]);
            }
        }
    };

    useEffect(() => {
        if (!isPaused && banners.length > 1) {
            timerRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 4500);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused, banners.length]);

    const handleBannerClick = (banner) => {
        const link = banner.linkUrl || "/categories";
        if (link.startsWith("http")) {
            window.open(link, "_blank");
        } else {
            navigate(link);
        }
    };

    if (!banners || banners.length === 0) return null;

    return (
        <div 
            className="banner-carousel-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                className="banner-track"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner, idx) => (
                    <div 
                        key={banner.id || idx} 
                        className="banner-slide"
                        onClick={() => handleBannerClick(banner)}
                    >
                        <img 
                            src={banner.imageUrl} 
                            alt={banner.title || "Banner"} 
                            className="banner-image"
                        />
                    </div>
                ))}
            </div>

            {banners.length > 1 && (
                <div className="banner-indicators">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            className={`banner-dot ${idx === currentIndex ? "active" : ""}`}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BannerCarousel;
