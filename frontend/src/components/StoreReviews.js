import React, { useState, useEffect } from 'react';
import { Star, Camera, Send, User } from 'lucide-react';
import { storesApi, backofficeApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const StoreReviews = ({ storeId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    image_url: null
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [storeId]);

  const loadReviews = async () => {
    try {
      const response = await storesApi.getReviews(storeId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const response = await backofficeApi.uploadImage(file);
      setNewReview(prev => ({ ...prev, image_url: response.data.url }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error('Por favor escribe un comentario');
      return;
    }

    setSubmitting(true);
    try {
      await storesApi.createReview(storeId, newReview);
      toast.success('¡Gracias por tu reseña!');
      setNewReview({ rating: 5, comment: '', image_url: null });
      setShowForm(false);
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="py-4 text-center text-slate-500">
        Cargando reseñas...
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">Reseñas del Local</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={16} className="text-yellow-500" fill="#EAB308" />
              <span className="font-bold">{averageRating}</span>
              <span className="text-slate-500">({reviews.length})</span>
            </div>
          )}
        </div>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-primary font-medium hover:underline"
            data-testid="write-store-review-btn"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl" data-testid="store-review-form">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tu calificación</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star
                    size={24}
                    className={star <= newReview.rating ? 'text-yellow-500' : 'text-slate-300'}
                    fill={star <= newReview.rating ? '#EAB308' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Tu comentario</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Cuéntanos tu experiencia con este comercio..."
              className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
              data-testid="store-review-comment"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Agregar foto (opcional)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <Camera size={18} />
                <span className="text-sm">{uploadingImage ? 'Subiendo...' : 'Subir foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              {newReview.image_url && (
                <img src={newReview.image_url} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="submit-store-review-btn"
            >
              <Send size={18} />
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center text-slate-500 py-4">
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-white border border-slate-100 rounded-xl" data-testid="store-review-item">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{review.user_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'text-yellow-500' : 'text-slate-300'}
                          fill={star <= review.rating ? '#EAB308' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{review.comment}</p>
                  {review.image_url && (
                    <img
                      src={review.image_url}
                      alt="Review"
                      className="mt-2 w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreReviews;
