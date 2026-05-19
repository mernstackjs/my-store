import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getProductsApi } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import type { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  const fetchProducts = async (p = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getProductsApi({
        page: p,
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
      });
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [search, category, sort]);

  const handleAddToCart = (product: Product) => {
    addItem({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
    });
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const hasActiveFilters = search || category || sort;

  return (
    <div>
      {/* Hero section for mobile */}
      <div className="md:hidden mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Discover</h1>
        <p className="text-gray-500 text-sm mt-1">Find something you'll love</p>
      </div>

      {/* Desktop header */}
      <div className="hidden md:block mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop</h1>
        <p className="text-gray-500">Discover our products</p>
      </div>

      {/* Search bar - always visible */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
        />
      </div>

      {/* Mobile filter toggle + active sort display */}
      <div className="flex items-center gap-2 md:hidden mb-4">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors tap-highlight ${
            filtersOpen || hasActiveFilters
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </button>

        {/* Quick sort on mobile */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setFiltersOpen(false); }}
          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sort: Newest</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Mobile expandable filters */}
      {filtersOpen && (
        <div className="md:hidden mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm animate-scale-in space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home">Home</option>
            </select>
          </label>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setSort(''); }}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden md:flex gap-3 mb-8">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm shadow-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square shimmer" />
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-4 w-3/4 rounded shimmer" />
                <div className="h-3 w-1/2 rounded shimmer" />
                <div className="flex justify-between items-center mt-3">
                  <div className="h-5 w-16 rounded shimmer" />
                  <div className="h-8 w-24 rounded-lg shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-16">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">No products found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setCategory(''); setSort(''); }}
              className="mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-800"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="product-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 stagger-item active:scale-[0.98]"
              >
                <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-square bg-gray-100">
                  <img
                    src={product.images[0] || ''}
                    alt={product.name}
                    className="product-card-img w-full h-full object-cover"
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.stock === 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                        Sold Out
                      </span>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                        Only {product.stock} left
                      </span>
                    )}
                    {product.ratingsAverage >= 4.5 && (
                      <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                        Top Rated
                      </span>
                    )}
                  </div>
                  {/* Quick add overlay on desktop */}
                  {product.stock > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="hidden md:flex absolute bottom-3 right-3 h-10 w-10 bg-white/90 backdrop-blur rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-indigo-600 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </Link>
                <div className="p-3 md:p-4">
                  <Link
                    to={`/product/${product._id}`}
                    className="font-semibold text-gray-900 text-sm md:text-base line-clamp-1 hover:text-indigo-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 md:flex-none py-2 md:py-1.5 px-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 tap-highlight ${
                        addedId === product._id
                          ? 'bg-green-500 text-white scale-95'
                          : product.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-indigo-600 active:scale-95'
                      }`}
                    >
                      {product.stock === 0 ? 'Sold Out' : addedId === product._id ? 'Added ✓' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 md:mt-10">
              <button
                onClick={() => fetchProducts(page - 1)}
                disabled={page <= 1}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors tap-highlight"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p)}
                  className={`h-10 w-10 rounded-xl text-sm font-medium transition-colors tap-highlight ${
                    p === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={page >= pages}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors tap-highlight"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
