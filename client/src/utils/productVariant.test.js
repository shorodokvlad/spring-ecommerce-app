import {
    configureProduct,
    findVariantFromSearch,
    getProductIdFromRoute,
    getProductPath
} from './productVariant';

const product = {
    id: 15,
    name: 'iPhone 17e',
    price: 699,
    stockQuantity: 10,
    imageUrl: '/default.jpg',
    variants: [
        {
            id: 31,
            title: '128GB / White',
            attributes: { Memory: '128GB', Color: 'White' },
            price: 699,
            stockQuantity: 4,
            imageUrls: ['/white.jpg']
        },
        {
            id: 32,
            title: '128GB / Pink',
            attributes: { Memory: '128GB', Color: 'Pink' },
            price: 719,
            stockQuantity: 6,
            imageUrls: ['/pink.jpg']
        }
    ]
};

describe('product variant links and identities', () => {
    test('creates a readable, shareable URL for the selected configuration', () => {
        expect(getProductPath(product, product.variants[1]))
            .toBe('/product/iphone-17e-15?memory=128gb&color=pink');
    });

    test('extracts the internal product id from legacy and slug URLs', () => {
        expect(getProductIdFromRoute('15')).toBe(15);
        expect(getProductIdFromRoute('iphone-17e-15')).toBe(15);
    });

    test('restores the selected configuration from the URL', () => {
        const selected = findVariantFromSearch(product, '?memory=128gb&color=pink');
        expect(selected.id).toBe(32);
    });

    test('gives each configuration a separate cart and favorite identity', () => {
        const white = configureProduct(product, product.variants[0]);
        const pink = configureProduct(product, product.variants[1]);

        expect(white.cartKey).toBe('15-v-31');
        expect(pink.cartKey).toBe('15-v-32');
        expect(pink.favoriteKey).not.toBe(white.favoriteKey);
        expect(pink.imageUrl).toBe('/pink.jpg');
    });
});
