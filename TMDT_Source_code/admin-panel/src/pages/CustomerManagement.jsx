import React, { useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { toast } from 'react-toastify';
import CustomerList from '../components/CustomerManagement/CustomerList';
import CustomerForm from '../components/CustomerManagement/CustomerForm';

const CustomerManagement = ({ token }) => {
    const [editCustomer, setEditCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        setEditCustomer(customer);
        setActiveTab(1); // Switch to Edit Customer tab
    };

    // Handle customer form success
    const handleCustomerSuccess = () => {
        setEditCustomer(null);
        setActiveTab(0); // Switch back to Customer List tab
        toast.success('Customer data saved successfully');
    };

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">Customer Management</h2>

            <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList className="flex mb-4 border-b">
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">
                        Customer List
                    </Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">
                        {editCustomer ? 'Edit Customer' : 'Add Customer'}
                    </Tab>
                </TabList>

                <TabPanel>
                    <CustomerList
                        onEdit={handleEditCustomer}
                        isLoading={isLoading}
                        setActiveTab={setActiveTab}
                    />
                </TabPanel>

                <TabPanel>
                    <CustomerForm
                        token={token}
                        editCustomer={editCustomer}
                        onSuccess={handleCustomerSuccess}
                    />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default CustomerManagement;