import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import { getProductApi } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchProduct = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getProductApi(id);
      setProduct(data.product);
    } catch {
      setError('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    setReviewError('');
    try {
      const { default: client } = await import('../api/client');
      await client.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewComment('');
      setReviewRating(5);
      fetchProduct();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setReviewError(axiosErr.response?.data?.message || 'Failed to submit review');
      } else {
        setReviewError('Failed to submit review');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">{error || 'Product not found'}</p>
      </div>
    );
  }

  const alreadyReviewed = user && product.reviews.some((r) => r.user === user._id);
  const images = product.images.length > 0 ? product.images : [''];

  return (
    <div className="pb-24 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
        {/* Image gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
            <img
              src={images[selectedImage] || ''}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Mobile: swipe dots */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === selectedImage ? 'w-6 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnail row */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-3 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover bg-gray-100" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(product.ratingsAverage) ? 'fill-current' : 'text-gray-200 fill-gray-200'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.ratingsAverage.toFixed(1)} ({product.ratingsQuantity} reviews)
            </span>
          </div>

          <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-6">
            ${product.price.toFixed(2)}
          </p>

          <p className="text-gray-600 mt-4 leading-relaxed text-sm md:text-base">{product.description}</p>

          <div className="mt-5">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Desktop quantity + add to cart */}
          {product.stock > 0 && (
            <div className="hidden md:flex items-center gap-3 mt-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-medium text-sm tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                }`}
              >
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Reviews ({product.reviews.length})
        </h2>

        {product.reviews.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500">No reviews yet. Be the first!</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          {product.reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{review.name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-amber-500">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>

        {isAuthenticated && !alreadyReviewed && (
          <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>

            {reviewError && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{reviewError}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewRating(n)}
                    className={`p-1 rounded-lg transition-colors tap-highlight ${
                      n <= reviewRating ? 'text-amber-500' : 'text-gray-200 hover:text-amber-300'
                    }`}
                  >
                    <svg className={`w-7 h-7 ${n <= reviewRating ? 'fill-current' : 'fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Share your experience with this product..."
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitting || !reviewComment.trim()}
              className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {!isAuthenticated && (
          <p className="text-sm text-gray-500 text-center py-4">
            Please <a href="/login" className="text-indigo-600 font-medium hover:underline">sign in</a> to write a review.
          </p>
        )}
      </div>

      {/* Mobile sticky add to cart bar */}
      {product.stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-3 z-40 pb-safe animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 tap-highlight"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-10 text-center font-bold text-sm tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="h-11 w-11 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors text-gray-500 tap-highlight"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 h-11 rounded-xl font-bold text-sm transition-all duration-200 tap-highlight ${
                addedToCart
                  ? 'bg-green-500 text-white scale-[0.98]'
                  : 'bg-indigo-600 text-white active:bg-indigo-700 shadow-lg shadow-indigo-200'
              }`}
            >
              {addedToCart ? 'Added! ✓' : `Add to Cart — $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
