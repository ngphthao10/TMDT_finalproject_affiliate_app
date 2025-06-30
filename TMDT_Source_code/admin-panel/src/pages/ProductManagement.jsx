import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ProductList from '../components/ProductManagement/ProductList'
import ProductForm from '../components/ProductManagement/ProductForm'
import CategoryManager from '../components/ProductManagement/CategoryManager'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import categoryService from '../services/categoryService'

const ProductManagement = ({ token }) => {
    const [editProduct, setEditProduct] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [subCategories, setSubCategories] = useState([])
    const [activeTab, setActiveTab] = useState(0);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setIsLoading(true)
            const response = await categoryService.getCategories()
            if (response.success) {
                setCategories(response.data || [])
            } else {
                toast.error(response.message || 'Failed to load categories')
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
            toast.error(error.message || 'An error occurred while loading categories')
        } finally {
            setIsLoading(false)
        }
    }

    // Fetch all subcategories
    const fetchSubCategories = async () => {
        try {
            setIsLoading(true)
            const response = await categoryService.getAllSubCategories()
            if (response.success) {
                setSubCategories(response.data || [])
            } else {
                toast.error(response.message || 'Failed to load subcategories')
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error)
            toast.error(error.message || 'An error occurred while loading subcategories')
        } finally {
            setIsLoading(false)
        }
    }

    // Edit product
    const handleEditProduct = (product) => {
        setEditProduct(product)
    }

    // Update handleProductSuccess
    const handleProductSuccess = () => {
        setEditProduct(null);
        setActiveTab(0); // Switch to Product List tab
    }

    useEffect(() => {
        fetchCategories()
        fetchSubCategories()
    }, [])

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">Product Management</h2>

            <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList className="flex mb-4 border-b">
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Product List</Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">
                        {editProduct ? 'Edit Product' : 'Add Product'}
                    </Tab>
                    <Tab className="px-4 py-2 mr-2 cursor-pointer rounded-t-lg hover:bg-gray-100">Categories</Tab>
                </TabList>

                <TabPanel>
                    <ProductList
                        onEdit={handleEditProduct}
                        isLoading={isLoading}
                        setActiveTab={setActiveTab}
                    />
                </TabPanel>

                <TabPanel>
                    <ProductForm
                        token={token}
                        editProduct={editProduct}
                        onSuccess={handleProductSuccess}
                    />
                </TabPanel>

                <TabPanel>
                    <CategoryManager />
                </TabPanel>
            </Tabs>
        </div>
    )
}

export default ProductManagement