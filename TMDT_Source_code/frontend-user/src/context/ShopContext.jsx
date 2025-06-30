import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '$';
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [bestSeller, setBestSeller] = useState([]);
  const navigate = useNavigate();


  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error('Select Product Size');
      return;
    }

    if (!token) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const product = await fetchProductById(itemId);
      const inventoryItem = product.inventory.find((inv) => inv.size === size);
      if (!inventoryItem) {
        toast.error('Size not available for this product');
        return;
      }

      const inventory_id = inventoryItem.inventory_id;
      const quantity = 1;
      console.log('Data being sent to /api/cart/add:', { inventory_id, quantity, token });
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { inventory_id, quantity: 1 }, // Không gửi user_id
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Product added to cart');
        await getUserCart(token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message);
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    if (cartItems.items && cartItems.items.length > 0) {
      totalCount = cartItems.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return totalCount;
  };

  const updateQuantity = async (cart_item_id, quantity, quantityinventory) => {
    if (quantity > quantityinventory) {
      toast.error('Out of Stock');
      return;
    }

    if (!token) {
      toast.error('Please login to update cart');
      navigate('/login');
      return;
    }
    console.log('Calling update with cart_item_id:', cart_item_id, 'quantity:', quantity);
    console.log('Backend URL:', `${backendUrl}/api/cart/update`);
    console.log('Token:', token);
    try {
      const response = await axios.put(
        `${backendUrl}/api/cart/update`,
        { cart_item_id, quantity },
        { headers: { token } }
      );

      if (response.data.success) {
        await getUserCart(token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      toast.error(error.message);
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    if (cartItems.items && cartItems.items.length > 0) {
      totalAmount = cartItems.items.reduce((sum, item) => sum + item.item_total, 0);
    }
    return totalAmount;
  };
  const removeFromCart = async (cart_item_id) => {
    if (!token) {
      toast.error('Please login to remove items from cart');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/cart/${cart_item_id}`, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success('Product removed from cart');
        await getUserCart(token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      toast.error(error.message);
    }
  };
  const getProductsData = async () => {
    try {

      const response = await axios.get(backendUrl + '/api/product/listAll')
      if (response.data.success) {
        setProducts(response.data.products)
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  const getBestSeller = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/best-sellers');
      console.log(response)
      if (response.data.success) {
        setBestSeller(response.data.products); // Lưu vào latestCollection thay vì products
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  const getUserCart = async (token) => {
    try {
      const response = await axios.get(`${backendUrl}/api/cart`, {
        // user_id sẽ được lấy từ token ở backend
        headers: { token },
      });

      if (response.data.success) {
        setCartItems(response.data.cart);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message);
      setCartItems({ session_id: null, items: [], total_price: 0 });
    }
  };
  const fetchProducts = async ({ page, limit, category, subCategory, search }) => {
    try {
      // Ánh xạ category từ tên sang category_id
      let category_id;
      if (category && category.length > 0) {
        const categoryIds = [];
        if (category.includes('Men')) categoryIds.push(1);
        if (category.includes('Women')) categoryIds.push(2);
        if (category.includes('Kids')) categoryIds.push(3);
        if (categoryIds.length > 0) {
          category_id = categoryIds.join(','); // Chuyển mảng thành chuỗi: "2,3"
        }
      }

      // Chuẩn bị tham số subCategory
      const subCategoryParam = subCategory ? subCategory.join(',') : undefined;

      // Gọi API filterProducts
      const response = await fetch(
        `${backendUrl}/api/product/filterProducts?page=${page}&limit=${limit}${category_id ? `&category_id=${category_id}` : ''
        }${subCategoryParam ? `&subCategory=${subCategoryParam}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''
        }`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      return {
        products: data.products,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error in fetchProducts:', error);
      throw error;
    }
  };
  const fetchProductById = async (productId) => {
    try {
      const response = await fetch(`${backendUrl}/api/product/details/${productId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch product');
      }

      const product = data.product;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        inventory: product.inventory.map((item) => ({
          inventory_id: item.id,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          available: item.available,
        })), // Trả về toàn bộ thông tin inventory
        image: product.images.map((img) => img.url), // Chuyển đổi mảng images thành mảng URL
        sizes: product.inventory.map((item) => item.size),// Lấy danh sách kích cỡ từ inventory
        category: product.category.name,
        subCategory: product.subCategory?.name || '',
        out_of_stock: product.out_of_stock,
        reviews_count: product.reviews_count,
        small_image: product.small_image,
      };
    } catch (error) {
      console.error('Error in fetchProductById:', error);
      throw error;
    }
  };
  useEffect(() => {
    getProductsData()
    getBestSeller();;
  }, [])

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'))
      getUserCart(localStorage.getItem('token'))
    }
    if (token) {
      getUserCart(token)
    }
  }, [token])

  const value = {
    products, currency, delivery_fee,
    search, setSearch, showSearch, setShowSearch,
    cartItems, addToCart, setCartItems,
    getCartCount, updateQuantity,
    getCartAmount, navigate, backendUrl,
    setToken, token, bestSeller, fetchProducts, fetchProductById, removeFromCart
  }

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )

}

export default ShopContextProvider;