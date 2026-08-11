import { cartReducer } from './CartContext';

const whitePhone = {
    id: 15,
    cartKey: '15-v-31',
    variantId: 31,
    name: 'iPhone 17e',
    stockQuantity: 4,
    quantity: 1
};

const pinkPhone = {
    ...whitePhone,
    cartKey: '15-v-32',
    variantId: 32
};

describe('variant-aware cart reducer', () => {
    afterEach(() => localStorage.clear());

    test('keeps configurations of the same product as separate cart lines', () => {
        const state = { cart: [whitePhone] };
        const nextState = cartReducer(state, { type: 'ADD_ITEM', payload: pinkPhone });

        expect(nextState.cart).toHaveLength(2);
        expect(nextState.cart.map((item) => item.cartKey))
            .toEqual(['15-v-31', '15-v-32']);
    });

    test('increments only the matching configuration', () => {
        const state = { cart: [whitePhone, pinkPhone] };
        const nextState = cartReducer(state, { type: 'ADD_ITEM', payload: pinkPhone });

        expect(nextState.cart.find((item) => item.cartKey === '15-v-31').quantity).toBe(1);
        expect(nextState.cart.find((item) => item.cartKey === '15-v-32').quantity).toBe(2);
    });
});
