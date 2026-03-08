import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { backofficeApi } from '../utils/api';
import { toast } from 'sonner';

const ImageUploader = ({ onImageUploaded, currentImage, label = "Imagen" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const response = await backofficeApi.uploadImage(file);
      const imageUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.image_url}`;
      onImageUploaded(imageUrl);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir imagen');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <X size={18} />
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader className="animate-spin text-primary" size={32} />
              <span className="text-sm text-slate-600">Subiendo imagen...</span>
            </>
          ) : (
            <>
              <ImageIcon className="text-slate-400" size={32} />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">Click para subir imagen</p>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG o WEBP (máx. 5MB)</p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
