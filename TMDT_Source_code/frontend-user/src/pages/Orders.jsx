import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from 'react-rating';
import { assets } from '../assets/assets';

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewData, setReviewData] = useState({
    rate: 0,
    content: '',
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [reviewedItems, setReviewedItems] = useState({}); // Object để lưu trạng thái review của từng item

  // Hàm kiểm tra xem order item đã được review chưa
  const checkIfItemReviewed = async (orderItemId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/reviews/check-review/${orderItemId}`,
        { headers: { token } }
      );
      return response.data.hasReview;
    } catch (error) {
      console.error('Error checking review status:', error);
      return false;
    }
  };

  // Hàm load trạng thái review cho tất cả items
  const loadReviewStatuses = async (orders) => {
    const statuses = {};
    for (const order of orders) {
      for (const item of order.items) {
        // Sử dụng order_item_id thay vì item.id để kiểm tra
        const hasReview = await checkIfItemReviewed(item.order_item_id);
        statuses[item.order_item_id] = hasReview; // Lưu theo order_item_id
      }
    }
    setReviewedItems(statuses);
  };

  const loadOrderData = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/order1/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const ordersWithItems = await Promise.all(
          response.data.orders.map(async (order) => {
            const itemsResponse = await axios.get(
              `${backendUrl}/api/order1/items/${order.id}`,
              { headers: { token } }
            );
            const updatedItems = itemsResponse.data.items.map((item) => ({
              ...item,
              image: item.image && item.image[0]
                ? [`${backendUrl}${item.image[0]}`]
                : [],
            }));
            return {
              ...order,
              items: updatedItems || [],
            };
          })
        );

        const sortedOrders = ordersWithItems.sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedOrders);

        // Load trạng thái review cho tất cả items
        await loadReviewStatuses(sortedOrders);
      } else {
        console.error('Failed to load orders:', response.data.message);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const openReviewModal = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedOrder(null);
    setSelectedItem(null);
    setReviewData({
      rate: 0,
      content: '',
    });
  };

  const handleReviewChange = (field, value) => {
    setReviewData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewData.rate === 0) {
      toast.error('Please select a rating.');
      return;
    }
    if (!reviewData.content.trim()) {
      toast.error('Please enter the review content.');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/reviews/add`,
        {
          product_id: selectedItem.product_id,
          rate: reviewData.rate,
          content: reviewData.content,
          order_item_id: selectedItem.order_item_id,
          status: 'pending',
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Review submitted successfully! It will be reviewed soon.');
        closeReviewModal();
        // Refresh data để cập nhật trạng thái
        await loadOrderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review.');
    }
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order1/cancel-order`,
        { orderId: orderToCancel.id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Order canceled successfully.');
        closeCancelModal();
        await loadOrderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error('Failed to cancel order.');
    }
  };

  // Hàm kiểm tra xem có thể review item không
  const canReviewItem = (item) => {
    return !reviewedItems[item.order_item_id]; // Kiểm tra theo order_item_id
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm md:text-base font-medium">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm md:text-base">
                    Total: {currency}{order.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`min-w-2 h-2 rounded-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                    ></p>
                    <p className="text-sm md:text-base">{order.status}</p>
                  </div>
                  <button
                    onClick={() => {
                      loadOrderData();
                    }}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    Refresh Status
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="border px-4 py-2 text-sm font-medium rounded-sm bg-red-500 text-white"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {order.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No items in this order.</p>
              ) : (
                order.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex flex-col md:flex-row md:items-center gap-4 py-2 border-t"
                  >
                    <div className="flex items-start gap-6 text-sm w-full">
                      <img
                        crossOrigin='anonymous'
                        className="w-16 sm:w-20"
                        src={item.image && item.image[0] ? item.image[0] : 'https://via.placeholder.com/80'}
                        alt={item.name}
                      />
                      <div className="flex-1">
                        <p className="sm:text-base font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                          <p>{currency}{item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Size: {item.size}</p>
                        </div>
                        <p className="mt-1">
                          Payment Method:{' '}
                          <span className="text-gray-400">{order.payment_method || 'N/A'}</span>
                        </p>
                        <p className="mt-1">
                          Payment Status:{' '}
                          <span className="text-gray-400">{order.payment_status}</span>
                        </p>
                      </div>
                      {order.status === 'delivered' && (
                        <>
                          {canReviewItem(item) ? (
                            <button
                              onClick={() => openReviewModal(order, item)}
                              className="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600"
                            >
                              Review
                            </button>
                          ) : (
                            <div className="text-green-500 px-4 py-2 text-sm">
                              ✓ Reviewed
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal to Add Review */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Review Product: {selectedItem?.name}</h2>
            <form onSubmit={submitReview} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Rating:</label>
                <Rating
                  initialRating={reviewData.rate}
                  onChange={(value) => handleReviewChange('rate', value)}
                  emptySymbol={<img src={assets.star_dull_icon} className="w-6 h-6" alt="empty star" />}
                  fullSymbol={<img src={assets.star_icon} className="w-6 h-6" alt="full star" />}
                  fractions={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Content:</label>
                <textarea
                  value={reviewData.content}
                  onChange={(e) => handleReviewChange('content', e.target.value)}
                  className="w-full p-2 border rounded-md resize-none"
                  rows="4"
                  placeholder="Write your review here..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to Confirm Cancel Order */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-medium mb-4">Cancel Order #{orderToCancel?.id}</h2>
            <p className="text-gray-700 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeCancelModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                No
              </button>
              <button
                onClick={cancelOrder}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;