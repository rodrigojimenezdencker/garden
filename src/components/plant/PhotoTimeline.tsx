import { useRef, useState } from 'react';
import { usePhotos } from '../../hooks/usePhotos';
import type { PlantPhoto } from '../../types';
import { Button } from '../ui/Button';
import { PhotoComparison } from './PhotoComparison';

const MAX_PHOTOS = 20;

const photoDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

interface PhotoTimelineProps {
  plantId: string;
}

export function PhotoTimeline({ plantId }: PhotoTimelineProps) {
  const { photos, loading, addPhoto, deletePhoto } = usePhotos(plantId);
  const [lightboxPhoto, setLightboxPhoto] = useState<PlantPhoto | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAtLimit = photos.length >= MAX_PHOTOS;

  const handleOpenUpload = () => {
    setUploadFile(null);
    setUploadCaption('');
    setUploadError('');
    setShowUploadForm(true);
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
    setUploadFile(null);
    setUploadCaption('');
    setUploadError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      await addPhoto(plantId, uploadFile, uploadCaption);
      handleCancelUpload();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'No se pudo subir la foto',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    setIsDeletingId(photoId);

    try {
      await deletePhoto(photoId);

      if (lightboxPhoto?.id === photoId) {
        setLightboxPhoto(null);
      }
    } finally {
      setIsDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4 text-gray-700">
        Cargando fotos...
      </div>
    );
  }

  if (showComparison) {
    return (
      <PhotoComparison
        onClose={() => setShowComparison(false)}
        photos={photos}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-garden-900">
          Fotos
          <span className="ml-2 text-sm font-normal text-gray-500">
            {photos.length}/{MAX_PHOTOS}
          </span>
        </h2>

        <div className="flex flex-wrap items-end gap-2">
          {photos.length >= 2 ? (
            <Button onClick={() => setShowComparison(true)} variant="secondary">
              Comparar
            </Button>
          ) : null}

          <div className="flex flex-col items-end gap-1">
            <Button disabled={isAtLimit} onClick={handleOpenUpload}>
              Añadir foto
            </Button>
            {isAtLimit ? (
              <p className="text-xs text-amber-600">Máximo 20 fotos</p>
            ) : null}
          </div>
        </div>
      </div>

      {showUploadForm ? (
        <div className="rounded-[1.75rem] border border-garden-100 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-garden-900">
                Nueva foto
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Guarda un momento importante de tu planta.
              </p>
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="photo-upload"
              >
                Foto
              </label>
              <input
                accept="image/*"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-full file:border-0 file:bg-garden-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-garden-800"
                id="photo-upload"
                onChange={(event) =>
                  setUploadFile(event.target.files?.[0] ?? null)
                }
                ref={fileInputRef}
                type="file"
              />
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="photo-caption"
              >
                Descripción (opcional)
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                id="photo-caption"
                onChange={(event) => setUploadCaption(event.target.value)}
                placeholder="Ej. Recién regada"
                value={uploadCaption}
              />
            </div>

            {uploadError ? (
              <p className="text-sm text-red-600">{uploadError}</p>
            ) : null}

            <div className="flex justify-end gap-2">
              <Button onClick={handleCancelUpload} variant="ghost">
                Cancelar
              </Button>
              <Button
                disabled={!uploadFile}
                loading={isUploading}
                onClick={handleUpload}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-garden-200 bg-garden-50/70 p-8 text-center">
          <p className="text-gray-500">
            Sin fotos todavía. ¡Añade la primera foto de{' '}
            <span className="font-medium text-garden-700">tu planta</span>!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <button
              className="group relative overflow-hidden rounded-2xl border border-garden-100 bg-garden-50 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garden-500"
              key={photo.id}
              onClick={() => setLightboxPhoto(photo)}
              type="button"
            >
              <img
                alt={photo.caption ?? 'Foto de planta'}
                className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105"
                src={photo.url}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 py-2">
                <p className="text-xs text-white/90">
                  {photoDateFormatter.format(photo.takenAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxPhoto !== null ? (
        <dialog
          aria-label="Ver foto"
          className="fixed inset-0 z-50 m-0 flex max-w-none items-center justify-center border-none bg-black/80 p-4"
          onClick={() => setLightboxPhoto(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setLightboxPhoto(null);
            }
          }}
          open
        >
          <div className="relative w-full max-w-3xl">
            <button
              aria-label="Cerrar"
              className="absolute -top-10 right-0 text-2xl font-bold text-white/80 transition-colors hover:text-white"
              onClick={() => setLightboxPhoto(null)}
              type="button"
            >
              ×
            </button>

            <img
              alt={lightboxPhoto.caption ?? 'Foto de planta'}
              className="max-h-[70vh] w-full rounded-2xl object-contain"
              src={lightboxPhoto.url}
            />

            <div className="mt-3 space-y-1 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-sm font-medium text-white">
                {photoDateFormatter.format(lightboxPhoto.takenAt)}
              </p>
              {lightboxPhoto.caption ? (
                <p className="text-sm text-white/80">{lightboxPhoto.caption}</p>
              ) : null}
              <div className="pt-2">
                <Button
                  loading={isDeletingId === lightboxPhoto.id}
                  onClick={() => handleDelete(lightboxPhoto.id)}
                  size="sm"
                  variant="danger"
                >
                  Eliminar foto
                </Button>
              </div>
            </div>
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
