import { render, screen, waitFor } from "@testing-library/react";
import DeliveryEstimate from "./DeliveryEstimate";
import ApiService from "../../service/ApiService";

// Factory mock: never load the real ApiService (its axios import is ESM, which Jest can't parse here)
jest.mock("../../service/ApiService", () => ({
    __esModule: true,
    default: {
        isAuthenticated: jest.fn(),
        getLoggedInUserInfo: jest.fn(),
        getDeliveryEstimate: jest.fn(),
        getDeliveryCounties: jest.fn(),
        getDeliveryLocalities: jest.fn(),
    },
}));
jest.mock("../context/CartContext", () => ({ useCart: () => ({ cart: [] }) }));

const estimate = (locality) => ({
    deliveryEstimate: {
        // The server normalizes the account's "Bucuresti" to "București"
        locality,
        county: "București",
        options: [{ type: "COURIER", label: "Courier", etaFrom: "2026-11-14", etaTo: "2026-11-15", cost: 0 }],
    },
});

beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
    ApiService.isAuthenticated.mockReturnValue(true);
    ApiService.getLoggedInUserInfo.mockResolvedValue({
        user: { address: { city: "Bucuresti", state: "Bucuresti", country: "RO" } },
    });
    ApiService.getDeliveryEstimate.mockResolvedValue(estimate("București"));
    ApiService.getDeliveryCounties.mockResolvedValue({ countyList: [] });
});

test("resolves the account address once instead of looping between spellings", async () => {
    render(<DeliveryEstimate defaultSubtotal={100} />);

    await waitFor(() => expect(screen.getByText(/București|Bucuresti/)).toBeInTheDocument());
    // Give any feedback loop time to show itself
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(ApiService.getLoggedInUserInfo).toHaveBeenCalledTimes(1);
    expect(ApiService.getDeliveryEstimate.mock.calls.length).toBeLessThanOrEqual(2);
});
