import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast } from 'react-toastify';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, backendUrl, removeFromCart } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({}); // Store the display value for each input
  const [prevQuantities, setPrevQuantities] = useState({}); // Store the last valid quantity for each input

  // Update cartData and quantities state when cartItems change
  useEffect(() => {
    if (cartItems && cartItems.items && cartItems.items.length > 0) {
      const tempData = cartItems.items.map((item) => ({
        _id: item.product.id,
        size: item.size,
        quantity: item.quantity,
        cart_item_id: item.cart_item_id,
        product: item.product,
        price: item.price,
        quantityinventory: item.product.quantity || 0, // Get available stock for the selected size
      }));

      // Update localQuantities and prevQuantities
      const newLocalQuantities = {};
      const newPrevQuantities = {};
      tempData.forEach((item) => {
        newLocalQuantities[item.cart_item_id] = item.quantity;
        newPrevQuantities[item.cart_item_id] = item.quantity;
      });

      setCartData(tempData);
      setLocalQuantities(newLocalQuantities);
      setPrevQuantities(newPrevQuantities);
    } else {
      setCartData([]);
      setLocalQuantities({});
      setPrevQuantities({});
    }
  }, [cartItems, products]);
console.log(cartItems.items)
  const handleQuantityChange = (cart_item_id, value, quantityinventory) => {
    const newQuantity = Number(value);

    // Allow temporary input if the value is empty or 0
    if (value === '' || value === '0') {
      setLocalQuantities((prev) => ({
        ...prev,
        [cart_item_id]: '',
      }));
      return;
    }

    // Check for quantity less than 1
    if (isNaN(newQuantity) || newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      setLocalQuantities((prev) => ({
        ...prev,
        [cart_item_id]: prevQuantities[cart_item_id], // Revert to previous value
      }));
      return; // Stop the function
    }

    // Check if the product is completely out of stock
    if (quantityinventory === 0) {
      toast.error('Product is completely out of stock');
      setLocalQuantities((prev) => ({
        ...prev,
        [cart_item_id]: prevQuantities[cart_item_id], // Revert to previous value
      }));
      return; // Stop the function
    }

    // Check if quantity exceeds available stock
    if (newQuantity > quantityinventory) {
      toast.error(`Only ${quantityinventory} items left in stock`);
      setLocalQuantities((prev) => ({
        ...prev,
        [cart_item_id]: prevQuantities[cart_item_id], // Revert to previous value
      }));
      return; // Stop the function
    }

    // If the value is valid, update the quantity and call updateQuantity
    setLocalQuantities((prev) => ({
      ...prev,
      [cart_item_id]: newQuantity,
    }));
    updateQuantity(cart_item_id, newQuantity, quantityinventory);
  };

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.map((item, index) => {
          const imageUrl = `${backendUrl}${item.product.small_image}`;

          return (
            <div
              key={index}
              className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >
              <div className='flex items-start gap-6'>
                <img
                  crossOrigin='anonymous'
                  className='w-16 sm:w-20'
                  src={imageUrl}
                  alt={item.product.name}
                />
                <div>
                  <p className='text-xs sm:text-lg font-medium'>{item.product.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency}{item.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                  </div>
                  {/* Display available stock */}
                  <p className='text-sm text-gray-500 mt-1'>
                    Available Stock: {item.quantityinventory}
                  </p>
                </div>
              </div>
              <input
                value={localQuantities[item.cart_item_id] || ''} // Control the input value with state
                onChange={(e) => handleQuantityChange(item.cart_item_id, e.target.value, item.quantityinventory)}
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                type='number'
                min={1}
              />
              <img
                onClick={() => removeFromCart(item.cart_item_id)}
                className='w-4 mr-4 sm:w-5 cursor-pointer'
                src={assets.bin_icon}
                alt='Remove'
              />
            </div>
          );
        })}
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button
              onClick={() => navigate('/place-order')}
              className={`text-sm my-8 px-8 py-3 ${
                cartData.length === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white'
              }`}
              disabled={cartData.length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;