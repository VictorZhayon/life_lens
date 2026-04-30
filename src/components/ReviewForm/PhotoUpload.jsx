import { useRef, useState } from 'react';

/**
 * Resize image to max dimension and convert to base64.
 */
function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ photos = [], onChange, maxPhotos = 3 }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files) => {
    const remaining = maxPhotos - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);

    for (const file of toProcess) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const base64 = await resizeImage(file);
        onChange([...photos, base64]);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }
  };

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm text-slate-300 font-medium">
        Photos <span className="text-slate-500">({photos.length}/{maxPhotos})</span>
      </label>

      {/* Preview */}
      {photos.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative group">
              <img src={photo} alt={`Upload ${idx + 1}`}
                className="w-20 h-20 rounded-xl object-cover border border-slate-700" />
              <button onClick={() => removePhoto(idx)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs
                  opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {photos.length < maxPhotos && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
            ${dragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'}`}
        >
          <p className="text-slate-400 text-sm">
            {dragging ? 'Drop here!' : '📷 Click or drag photos here'}
          </p>
          <p className="text-slate-600 text-xs mt-1">JPG, PNG — max 3 photos</p>
          <input ref={fileRef} type="file" accept="image/*" multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden" />
        </div>
      )}
    </div>
  );
}
