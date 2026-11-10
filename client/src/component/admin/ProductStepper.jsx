import React from "react";

export const PRODUCT_STEPS = [
    "Basics",
    "Specifications",
    "Configurations",
    "Pricing & Stock",
    "Photos",
    "Review",
];

const ProductStepper = ({ step, maxStep, onStepClick }) => (
    <div className="product-stepper-wrap">
        <ol className="product-stepper">
            {PRODUCT_STEPS.map((label, i) => {
                const n = i + 1;
                const state = n === step ? "active" : n < step ? "done" : "";
                const clickable = n !== step && n <= maxStep;
                return (
                    <li key={label} className={`product-step ${state}`}>
                        <button type="button" disabled={!clickable} onClick={() => onStepClick(n)}>
                            <span className="product-step-num">{n < step ? "✓" : n}</span>
                            <span className="product-step-label">{label}</span>
                        </button>
                    </li>
                );
            })}
        </ol>
        <p className="product-step-caption">
            Step {step}/{PRODUCT_STEPS.length} — <strong>{PRODUCT_STEPS[step - 1]}</strong>
        </p>
    </div>
);

export default ProductStepper;
