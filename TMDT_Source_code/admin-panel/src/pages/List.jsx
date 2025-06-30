import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
    const [list, setList] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchList = async () => {
        setLoading(true)
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                // Make sure we have valid image URLs and handle missing data
                const products = response.data.products.map(product => ({
                    ...product,
                    image: product.image?.length ? product.image : ['https://placehold.co/200'],
                    category: product.category || 'Uncategorized',
                    price: product.price || 0
                }))
                setList(products.reverse())
            } else {
                toast.error(response.data.message || 'Failed to fetch products')
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'An error occurred while fetching products')
        } finally {
            setLoading(false)
        }
    }

    const removeProduct = async (id) => {
        if (!window.confirm('Are you sure you want to remove this product?')) {
            return
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/product/remove',
                { id },
                { headers: { token } }
            )

            if (response.data.success) {
                toast.success(response.data.message || 'Product removed successfully')
                await fetchList()
            } else {
                toast.error(response.data.message || 'Failed to remove product')
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'An error occurred while removing the product')
        }
    }

    useEffect(() => {
        fetchList()
    }, [])

    return (
        <>
            <p className='mb-2'>All Products List</p>

            {loading ? (
                <div className='text-center py-4'>Loading products...</div>
            ) : list.length === 0 ? (
                <div className='text-center py-4'>No products found</div>
            ) : (
                <div className='flex flex-col gap-2'>
                    {/* ------- List Table Title ---------- */}
                    <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
                        <b className='text-center'>Image</b>
                        <b>Name</b>
                        <b>Category</b>
                        <b>Price</b>
                        <b className='text-center'>Action</b>
                    </div>

                    {/* ------ Product List ------ */}
                    {list.map((item, index) => (
                        <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
                            <div className='flex justify-center'>
                                <img
                                    className='w-12 h-12 object-cover border'
                                    src={item.image[0]}
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = 'https://placehold.co/200'
                                    }}
                                />
                            </div>
                            <p className='truncate'>{item.name}</p>
                            <p className='truncate'>{item.category}</p>
                            <p>{currency}{item.price}</p>
                            <div className='flex justify-end md:justify-center'>
                                <button
                                    onClick={() => removeProduct(item._id)}
                                    className='text-red-500 hover:text-red-700 text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100'
                                    title="Remove product"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}

export default List