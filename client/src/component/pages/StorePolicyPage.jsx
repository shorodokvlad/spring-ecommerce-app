import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import '../../style/storePolicyPage.css';

const StorePolicyPage = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState("shipping");

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const section = queryParams.get("section");
        if (section && ["shipping", "warranty", "returns", "secure"].includes(section)) {
            setActiveSection(section);
            const el = document.getElementById(section);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [location.search]);

    const handleTabClick = (sectionId) => {
        setActiveSection(sectionId);
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <div className="store-policy-page">
            <header className="policy-header">
                <nav className="policy-breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">Store Guarantees</span>
                </nav>
                <p className="policy-eyebrow">SHV Store Commitments</p>
                <h1>Store Guarantees & Customer Protection</h1>
                <p className="policy-subtitle">
                    Learn more about our premium delivery services, 2-year warranty protections, seamless 30-day returns, and enterprise-grade checkout security.
                </p>
            </header>

            {/* Quick Navigation Tabs */}
            <div className="policy-tabs">
                <button
                    type="button"
                    className={`policy-tab-btn ${activeSection === "shipping" ? "active" : ""}`}
                    onClick={() => handleTabClick("shipping")}
                >
                    <img src="/truck.svg" alt="Shipping" />
                    <span>Free Express Shipping</span>
                </button>
                <button
                    type="button"
                    className={`policy-tab-btn ${activeSection === "warranty" ? "active" : ""}`}
                    onClick={() => handleTabClick("warranty")}
                >
                    <img src="/shield.svg" alt="Warranty" />
                    <span>2-Year Official Warranty</span>
                </button>
                <button
                    type="button"
                    className={`policy-tab-btn ${activeSection === "returns" ? "active" : ""}`}
                    onClick={() => handleTabClick("returns")}
                >
                    <img src="/calendar.svg" alt="Returns" />
                    <span>30-Day Money Back</span>
                </button>
                <button
                    type="button"
                    className={`policy-tab-btn ${activeSection === "secure" ? "active" : ""}`}
                    onClick={() => handleTabClick("secure")}
                >
                    <img src="/lock.svg" alt="Secure" />
                    <span>Secure 256-Bit Checkout</span>
                </button>
            </div>

            {/* Detailed Content Cards */}
            <div className="policy-content-grid">
                {/* 1. Shipping Section */}
                <section id="shipping" className={`policy-card ${activeSection === "shipping" ? "highlighted" : ""}`}>
                    <div className="policy-card-header">
                        <div className="policy-card-icon-badge">
                            <img src="/truck.svg" alt="Shipping" />
                        </div>
                        <div>
                            <h2>Free Express Shipping</h2>
                            <p className="card-subtitle">Fast, tracked delivery directly to your doorstep across Europe.</p>
                        </div>
                    </div>
                    <div className="policy-card-body">
                        <p>
                            We partner with premium international couriers (DHL Express, FedEx, UPS) to ensure your package arrives fast, safe, and fully insured.
                        </p>
                        <ul>
                            <li><strong>Delivery Time:</strong> 1 to 3 business days for all express orders.</li>
                            <li><strong>Zero Shipping Cost:</strong> Free delivery on all orders over €50.</li>
                            <li><strong>Live GPS Tracking:</strong> You receive a real-time tracking link as soon as your dispatch label is printed.</li>
                            <li><strong>Signature on Delivery:</strong> Extra protection requiring a digital signature upon delivery.</li>
                        </ul>
                    </div>
                </section>

                {/* 2. Warranty Section */}
                <section id="warranty" className={`policy-card ${activeSection === "warranty" ? "highlighted" : ""}`}>
                    <div className="policy-card-header">
                        <div className="policy-card-icon-badge">
                            <img src="/shield.svg" alt="Warranty" />
                        </div>
                        <div>
                            <h2>2-Year Official Warranty</h2>
                            <p className="card-subtitle">Complete peace of mind with authentic manufacturer warranty coverage.</p>
                        </div>
                    </div>
                    <div className="policy-card-body">
                        <p>
                            Every electronic device purchased at SHV Store is 100% brand new, original, and backed by a comprehensive 24-month manufacturer warranty.
                        </p>
                        <ul>
                            <li><strong>Full Hardware Coverage:</strong> Covers technical defects, internal motherboard issues, display malfunctions, and battery health.</li>
                            <li><strong>Genuine OEM Parts:</strong> All repairs or replacements are handled by authorized service technicians using official parts.</li>
                            <li><strong>Dedicated Support Team:</strong> Priority customer care via email and phone for instant claim handling.</li>
                        </ul>
                    </div>
                </section>

                {/* 3. Returns Section */}
                <section id="returns" className={`policy-card ${activeSection === "returns" ? "highlighted" : ""}`}>
                    <div className="policy-card-header">
                        <div className="policy-card-icon-badge">
                            <img src="/calendar.svg" alt="Returns" />
                        </div>
                        <div>
                            <h2>30-Day Money-Back Guarantee</h2>
                            <p className="card-subtitle">Hassle-free return policy with zero restock fees.</p>
                        </div>
                    </div>
                    <div className="policy-card-body">
                        <p>
                            We want you to be completely thrilled with your purchase. If you change your mind for any reason, you have 30 calendar days from delivery to request a full refund or product exchange.
                        </p>
                        <ul>
                            <li><strong>Pre-paid Return Labels:</strong> We provide a complimentary return courier label at no extra charge.</li>
                            <li><strong>Instant Refunds:</strong> Once returned items are inspected, refunds are credited back to your payment method within 48 hours.</li>
                            <li><strong>No Hassle:</strong> Simple 3-step return request directly from your profile account page.</li>
                        </ul>
                    </div>
                </section>

                {/* 4. Secure Checkout Section */}
                <section id="secure" className={`policy-card ${activeSection === "secure" ? "highlighted" : ""}`}>
                    <div className="policy-card-header">
                        <div className="policy-card-icon-badge">
                            <img src="/lock.svg" alt="Secure" />
                        </div>
                        <div>
                            <h2>Secure 256-Bit Checkout</h2>
                            <p className="card-subtitle">Bank-grade encryption protecting your payment details.</p>
                        </div>
                    </div>
                    <div className="policy-card-body">
                        <p>
                            Your privacy and payment security are our top priorities. All transactions are encrypted using TLS 1.3 with 256-bit SSL certificate security.
                        </p>
                        <ul>
                            <li><strong>PCI-DSS Level 1 Compliant:</strong> Certified security standards powered by Stripe and PayPal gateways.</li>
                            <li><strong>No Stored Credentials:</strong> We never save or store your credit card details on our local servers.</li>
                            <li><strong>Buyer Protection:</strong> Guaranteed protection against fraudulent transactions and unauthorized charges.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StorePolicyPage;
