import React from "react";
import "../../style/specificationsTable.css";

const SpecificationsTable = ({ sections }) => {
    const validSections = (sections || []).filter(sec =>
        sec.items && sec.items.some(item => item.label && item.value && item.value.trim() !== "")
    );

    if (validSections.length === 0) return null;

    return (
        <div className="specifications-container">
            <h2 className="spec-main-title">Specifications</h2>

            {validSections.map((section, sIdx) => {
                const filledItems = section.items.filter(item => item.label && item.value && item.value.trim() !== "");
                if (filledItems.length === 0) return null;

                return (
                    <div className="spec-section" key={sIdx}>
                        <h3 className="spec-section-header">{section.title}</h3>
                        <div className="spec-table">
                            {filledItems.map((item, iIdx) => (
                                <div
                                    className={`spec-row ${iIdx % 2 === 0 ? 'stripe-even' : 'stripe-odd'}`}
                                    key={iIdx}
                                >
                                    <div className="spec-label">{item.label}</div>
                                    <div className="spec-value">
                                        {item.value.includes('\n') ? (
                                            item.value.split('\n').map((valLine, vIdx) => (
                                                <div key={vIdx}>{valLine}</div>
                                            ))
                                        ) : (
                                            item.value
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SpecificationsTable;
