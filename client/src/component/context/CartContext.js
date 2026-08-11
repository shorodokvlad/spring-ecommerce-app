import React, {createContext, useReducer, useContext, useEffect} from "react";

const CartContext = createContext();

const itemIdentity = (item) => item.cartKey || String(item.id);

// Quantity can never exceed available stock (unknown stock = no cap)
const cappedQuantity = (wanted, stockQuantity) =>
    stockQuantity == null ? wanted : Math.min(wanted, stockQuantity);

const initialState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
}


export const cartReducer = (state, action) =>{
    switch(action.type){
        case 'ADD_ITEM': {
            //identify exisitng item
            const payloadKey = itemIdentity(action.payload);
            const existingItem = state.cart.find(item => itemIdentity(item) === payloadKey);
            let newCart;

            if(existingItem){
                newCart = state.cart.map(item =>
                    itemIdentity(item) === payloadKey
                    ? {...item, quantity: cappedQuantity(item.quantity + 1, item.stockQuantity)}
                    : item
                );
            }else {
                newCart = [...state.cart, {...action.payload, quantity: 1 }];
            }
            localStorage.setItem('cart', JSON.stringify(newCart));
            return {...state, cart:newCart};
        }

        case 'REMOVE_ITEM':{
            const payloadKey = itemIdentity(action.payload);
            const newCart = state.cart.filter(item => itemIdentity(item) !== payloadKey);
            localStorage.setItem('cart', JSON.stringify(newCart));
            return {...state, cart:newCart};
        }

        case 'INCREMENT_ITEM': {
            const payloadKey = itemIdentity(action.payload);
            const newCart = state.cart.map(item=>
                itemIdentity(item) === payloadKey
                ? {...item, quantity: cappedQuantity(item.quantity + 1, item.stockQuantity)}
                :item
            );
            localStorage.setItem('cart', JSON.stringify(newCart));
            return {...state, cart:newCart};
        }

        case 'DECREMENT_ITEM': {
            const payloadKey = itemIdentity(action.payload);
            const newCart = state.cart.map(item =>
                itemIdentity(item) === payloadKey && item.quantity > 1
                ? {...item, quantity: item.quantity -1}
                :item
            )
            localStorage.setItem('cart', JSON.stringify(newCart));
            return {...state, cart:newCart};
        }

        case 'CLEAR_CART': {
            localStorage.removeItem('cart');
            return {...state, cart:[]};
        }
        default:
            return state;
    }
};




export const CartProvider = ({children}) => {

    const [state, dispatch] = useReducer(cartReducer, initialState);


    useEffect(() =>{
        localStorage.setItem('cart', JSON.stringify(state.cart));
    }, [state.cart]);

    return (
        <CartContext.Provider value={{cart: state.cart, dispatch}}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext);
