import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import KOLList from '../components/KOLManagement/KOLList';
import KOLApplications from '../components/KOLManagement/KOLApplications';
import KOLTierManager from '../components/KOLManagement/KOLTierManager';
import KOLPayouts from '../components/KOLManagement/KOLPayouts';

const KOLManagement = ({ token }) => {
    const [editKOL, setEditKOL] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Handle editing a KOL
    const handleEditKOL = (kol) => {
        setEditKOL(kol);
        setActiveTab(2); // Switch to Contract tab
    };

    // Handle success after operations
    const handleSuccess = () => {
        setEditKOL(null);
        setActiveTab(0); // Switch back to KOL List tab
        setRefreshTrigger(prev => prev + 1); // Trigger refresh of lists
    };

    // Handle application approval/rejection
    const handleApplicationUpdate = () => {
        toast.success("Application status updated successfully");
        setRefreshTrigger(prev => prev + 1); // Trigger refresh of lists
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">KOL Management</h2>

            <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList className="flex mb-4 border-b">
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">KOL List</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Applications</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Tier Settings</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Payouts</Tab>
                </TabList>

                <TabPanel>
                    <KOLList
                        onEdit={handleEditKOL}
                        isLoading={isLoading}
                        refreshTrigger={refreshTrigger}
                        token={token}
                    />
                </TabPanel>

                <TabPanel>
                    <KOLApplications
                        onApprove={handleApplicationUpdate}
                        onReject={handleApplicationUpdate}
                        isLoading={isLoading}
                        refreshTrigger={refreshTrigger}
                        token={token}
                    />
                </TabPanel>

                <TabPanel>
                    <KOLTierManager token={token} />
                </TabPanel>

                <TabPanel>
                    <KOLPayouts token={token} refreshTrigger={refreshTrigger} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default KOLManagement;