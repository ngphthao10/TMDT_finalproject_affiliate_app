import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { search, showSearch, fetchProducts } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 16;

  // Danh sách categories và subcategories
  const categoriesList = ['Men', 'Women', 'Kids'];
  const subCategoriesList = ['Topwear', 'Bottomwear', 'Winterwear'];

  // Hàm toggleCategory
  const toggleCategory = (e) => {
    const value = e.target.value;
    if (category.includes(value)) {
      setCategory((prev) => prev.filter((item) => item !== value));
    } else {
      setCategory((prev) => [...prev, value]);
    }
    setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Hàm toggleSubCategory
  const toggleSubCategory = (e) => {
    const value = e.target.value;
    if (subCategory.includes(value)) {
      setSubCategory((prev) => prev.filter((item) => item !== value));
    } else {
      setSubCategory((prev) => [...prev, value]);
    }
    setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Hàm xóa tất cả bộ lọc
  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSortType('relavent');
    setPage(1);
  };

  // Hàm gọi API để lấy sản phẩm
  const fetchProductsWithPagination = async () => {
    try {
      const response = await fetchProducts({
        page,
        limit,
        category: category.length > 0 ? category : undefined,
        subCategory: subCategory.length > 0 ? subCategory : undefined,
        search: showSearch && search ? search : undefined,
      });

      const { products, pagination } = response;
      const apiLimit = pagination?.limit || limit;

      setFilterProducts(products);
      setTotalPages(Math.ceil(pagination.total / apiLimit) || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setFilterProducts([]);
      setTotalPages(1);
    }
  };

  // Hàm sắp xếp sản phẩm
  const sortProduct = () => {
    let fpCopy = [...filterProducts];

    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a, b) => parseFloat(a.price.min || 0) - parseFloat(b.price.min || 0)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a, b) => parseFloat(b.price.min || 0) - parseFloat(a.price.min || 0)));
        break;
      default:
        fetchProductsWithPagination();
        break;
    }
  };

  // Gọi API khi page, category, subCategory, search thay đổi
  useEffect(() => {
    fetchProductsWithPagination();
  }, [page, category, subCategory, search, showSearch]);

  // Sắp xếp sản phẩm khi sortType thay đổi
  useEffect(() => {
    sortProduct();
  }, [sortType]);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };
  console.log('product list:', filterProducts)
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {categoriesList.map((cat, index) => (
              <p key={index} className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value={cat}
                  onChange={toggleCategory}
                  checked={category.includes(cat)}
                />
                {cat}
              </p>
            ))}
          </div>
        </div>
        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {subCategoriesList.map((type, index) => (
              <p key={index} className="flex gap-2">
                <input
                  className="w-3"
                  type="checkbox"
                  value={type}
                  onChange={toggleSubCategory}
                  checked={subCategory.includes(type)}
                />
                {type}
              </p>
            ))}
          </div>
        </div>
        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Filters
        </button>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            value={sortType}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.length > 0 ? (
            filterProducts.map((item, index) => (
              <ProductItem
                key={index}
                name={item.name}
                id={item.id}
                price={item.price.min || 0}
                image={item.small_image}
              />
            ))
          ) : (
            <p>No products found</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {totalPages > 1 ? (
            <>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 border rounded ${page === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 border rounded ${page === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                Next
              </button>
            </>
          ) : (
            <span>No pagination needed</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;