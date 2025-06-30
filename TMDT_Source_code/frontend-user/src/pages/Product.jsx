import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {
  const { productId } = useParams();
  const { currency, addToCart, fetchProductById, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const baseImageUrl = backendUrl;

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProductById(productId);
      setProductData(product);
      setImage(product.small_image ? `${baseImageUrl}${product.small_image}` : '');
      setReviews([]);
      await fetchReviews(product.id);
    } catch (err) {
      setError('Failed to load product information: ' + err.message);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    setLoadingReviews(true);
    try {
      const url = `${backendUrl}/api/reviews/list`;
      const params = {
        product_id: productId,
        page: 1,
        limit: 10,
        sort_by: 'creation_at',
        sort_order: 'DESC',
      };
      const response = await axios.get(url, { params });

      if (response.data.success) {
        setReviews(response.data.reviews);
      } else {
        console.error('Failed to load reviews:', response.data.message);
        toast.error('Failed to load reviews: ' + response.data.message);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error loading reviews: ' + error.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Tính toán average rating từ reviews
  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rate, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  // Render rating stars based on average rating
  const renderRatingStars = () => {
    const avgRating = getAverageRating();
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    const stars = [];

    // Render full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <img key={`full-${i}`} src={assets.star_icon} alt="" className="w-3 h-3" />
      );
    }

    // Render half star if needed
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <img key="half" src={assets.star_icon} alt="" className="w-3 h-3 opacity-50" />
      );
    }

    // Render empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <img key={`empty-${i}`} src={assets.star_dull_icon} alt="" className="w-3 h-3" />
      );
    }

    return stars;
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, fetchProductById]);

  const getPriceBySize = () => {
    if (!productData || !productData.inventory) return 0;
    if (!size) {
      return productData.inventory[0]?.price || 0;
    }
    const selectedItem = productData.inventory.find((item) => item.size === size);
    return selectedItem?.price || 0;
  };

  const isOutOfStockForSize = (sizeToCheck = size) => {
    if (!productData || !productData.inventory || !sizeToCheck) return false;
    const selectedItem = productData.inventory.find((item) => item.size === sizeToCheck);
    return selectedItem ? selectedItem.quantity === 0 : false;
  };

  const getStockForSize = (sizeToCheck) => {
    if (!productData || !productData.inventory) return 0;
    const selectedItem = productData.inventory.find((item) => item.size === sizeToCheck);
    return selectedItem?.quantity || 0;
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* Product Information */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.small_image && (
              <img
                crossOrigin="anonymous"
                onClick={() => setImage(`${baseImageUrl}${productData.small_image}`)}
                src={`${baseImageUrl}${productData.small_image}`}
                className="w-[142px] h-[120px] sm:mb-3 flex-shrink-0 cursor-pointer object-cover"
                alt=""
              />
            )}
            {productData.image.map((item, index) => (
              <img
                crossOrigin="anonymous"
                onClick={() => setImage(`${baseImageUrl}${item}`)}
                src={`${baseImageUrl}${item}`}
                key={index}
                className="w-[142px] h-[120px] sm:mb-3 flex-shrink-0 cursor-pointer object-cover"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            {image ? (
              <img crossOrigin="anonymous" className="w-full h-auto" src={image} alt="" />
            ) : (
              <p className="text-center text-gray-500">No image available</p>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            {renderRatingStars()}
            <p className="pl-2">
              ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              {reviews.length > 0 && (
                <span className="text-sm text-gray-500 ml-1">
                  - {getAverageRating()} stars
                </span>
              )}
            </p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {getPriceBySize()}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {productData.sizes.map((item, index) => {
                const isOutOfStock = isOutOfStockForSize(item);
                const stockCount = getStockForSize(item);
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => !isOutOfStock && setSize(item)}
                      className={`border py-2 px-4 text-sm font-medium transition-all duration-200 relative ${item === size
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : isOutOfStock
                            ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed opacity-40'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                        }`}
                      disabled={isOutOfStock}
                    >
                      {item}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-red-300 transform rotate-45 absolute"></div>
                          <div className="w-full h-0.5 bg-red-300 transform -rotate-45 absolute"></div>
                        </div>
                      )}
                    </button>
                    {/* Tooltip hiển thị stock */}
                    {!isOutOfStock && (
                      <div className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {stockCount} in stock
                      </div>
                    )}
                    {/* Tooltip out of stock */}
                    {isOutOfStock && (
                      <div className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        Out of stock
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Display available stock for the selected size */}
            {size && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  Available Stock:
                  <span className={`ml-1 font-medium ${getStockForSize(size) > 10
                      ? 'text-green-600'
                      : getStockForSize(size) > 0
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}>
                    {getStockForSize(size)}
                  </span>
                </p>
                {getStockForSize(size) <= 5 && getStockForSize(size) > 0 && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="relative inline-block">
            <button
              onClick={() => addToCart(productData.id, size)}
              className={`bg-black text-white px-8 py-3 text-sm font-medium transition-all duration-200 ${productData.out_of_stock || !size || isOutOfStockForSize()
                  ? 'opacity-50 cursor-not-allowed bg-gray-400'
                  : 'hover:bg-gray-800 active:bg-gray-700'
                }`}
              disabled={productData.out_of_stock || !size || isOutOfStockForSize()}
            >
              {!size
                ? 'SELECT SIZE'
                : isOutOfStockForSize()
                  ? 'OUT OF STOCK'
                  : 'ADD TO CART'
              }
            </button>
            {/* Tooltip for different states */}
            {!size && (
              <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Please select a size first
              </div>
            )}
            {(productData.out_of_stock || isOutOfStockForSize()) && size && (
              <div className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                This size is out of stock
              </div>
            )}
          </div>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on Delivery Available.</p>
            <p>Easy Returns within 7 Days.</p>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="mt-20">
        <div className="flex">
          <button
            onClick={() => setActiveTab('description')}
            className={`border px-5 py-3 text-sm ${activeTab === 'description' ? 'font-bold bg-gray-100' : ''
              }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border px-5 py-3 text-sm ${activeTab === 'reviews' ? 'font-bold bg-gray-100' : ''
              }`}
          >
            Reviews ({reviews.length})
            {reviews.length > 0 && (
              <span className="ml-1 text-yellow-500">
                ★ {getAverageRating()}
              </span>
            )}
          </button>
        </div>
        <div className="border px-6 py-6 text-sm text-gray-500">
          {activeTab === 'description' ? (
            <div className="flex flex-col gap-4">
              <p>{productData.description}</p>
              <p>
                E-commerce websites typically display products or services along with detailed descriptions,
                images, prices, and available variants (e.g., sizes, colors). Each product usually has its own page with relevant information.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviews.length > 0 ? (
                <>
                  {/* Review Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Customer Reviews Summary</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {renderRatingStars()}
                      </div>
                      <span className="text-lg font-medium text-gray-800">
                        {getAverageRating()} out of 5
                      </span>
                      <span className="text-gray-600">
                        ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  {reviews.map((review) => (
                    <div key={review.review_id} className="border-b pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">
                          {review.user_id?.username || `User #${review.user_id}`}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src={
                                index < review.rate
                                  ? assets.star_icon
                                  : assets.star_dull_icon
                              }
                              alt=""
                              className="w-3 h-3"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(review.creation_at).toLocaleString('en-US')}
                      </p>
                      <p className="mt-2 text-gray-700">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews for this product yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Be the first to leave a review!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        productId={productData.id}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;