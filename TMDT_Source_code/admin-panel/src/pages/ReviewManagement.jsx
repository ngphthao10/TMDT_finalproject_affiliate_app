import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ReviewList from '../components/ReviewManagement/ReviewList';
import ReviewDetailsModal from '../components/ReviewManagement/ReviewDetailsModal';
import reviewService from '../services/reviewService';

const ReviewManagement = ({ token }) => {
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Handle review click to view details
    const handleReviewClick = async (reviewId) => {
        try {
            setIsLoading(true);
            const response = await reviewService.getReviewDetails(reviewId);
            if (response.success) {
                setSelectedReview(response.data);
                setIsModalOpen(true);
            } else {
                toast.error(response.message || 'Failed to load review details');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while loading review details');
            console.error('Error loading review details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle review status update (approve/reject)
    const handleReviewUpdate = (updatedReview) => {
        // Update the selected review with new status
        setSelectedReview(updatedReview);
        // Trigger refresh to reload the reviews list
        setRefreshTrigger(prev => prev + 1);
        toast.success(`Review ${updatedReview.status === 'approved' ? 'approved' : 'rejected'} successfully`);
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">Review Management</h2>

            <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList className="flex mb-4 border-b">
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Pending Reviews</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Approved Reviews</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Rejected Reviews</Tab>
                </TabList>

                <TabPanel>
                    <ReviewList
                        status="pending"
                        onReviewClick={handleReviewClick}
                        isLoading={isLoading}
                        refreshTrigger={refreshTrigger}
                        token={token}
                    />
                </TabPanel>

                <TabPanel>
                    <ReviewList
                        status="approved"
                        onReviewClick={handleReviewClick}
                        isLoading={isLoading}
                        refreshTrigger={refreshTrigger}
                        token={token}
                    />
                </TabPanel>

                <TabPanel>
                    <ReviewList
                        status="rejected"
                        onReviewClick={handleReviewClick}
                        isLoading={isLoading}
                        refreshTrigger={refreshTrigger}
                        token={token}
                    />
                </TabPanel>
            </Tabs>

            {selectedReview && (
                <ReviewDetailsModal
                    review={selectedReview}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onReviewUpdate={handleReviewUpdate}
                    token={token}
                />
            )}
        </div>
    );
};

export default ReviewManagement;