import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStorage = { name: 'storage' };
const ref = vi.fn();
const uploadBytesResumable = vi.fn();
const getDownloadURL = vi.fn();
const deleteObject = vi.fn();

vi.mock('../../lib/firebase', () => ({
  storage: mockStorage,
}));

vi.mock('firebase/storage', () => ({
  ref: (...args: unknown[]) => ref(...args),
  uploadBytesResumable: (...args: unknown[]) => uploadBytesResumable(...args),
  getDownloadURL: (...args: unknown[]) => getDownloadURL(...args),
  deleteObject: (...args: unknown[]) => deleteObject(...args),
}));

describe('storage service', () => {
  beforeEach(() => {
    ref.mockReset();
    uploadBytesResumable.mockReset();
    getDownloadURL.mockReset();
    deleteObject.mockReset();

    ref.mockImplementation((_storage, path: string) => ({ path }));
  });

  it('uploadPhoto rejects files larger than 5MB', async () => {
    const { uploadPhoto } = await import('../storage');
    const file = new File(['x'], 'large.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 + 1 });

    await expect(uploadPhoto(file, 'plant-photos/large.jpg')).rejects.toThrow(
      'El archivo excede el tamaño máximo de 5MB',
    );
  });

  it('uploadPhoto rejects non-image files', async () => {
    const { uploadPhoto } = await import('../storage');
    const file = new File(['x'], 'document.pdf', { type: 'application/pdf' });

    await expect(
      uploadPhoto(file, 'plant-photos/document.pdf'),
    ).rejects.toThrow(
      'Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF',
    );
  });

  it('uploadPhoto accepts valid images', async () => {
    const storageRef = { path: 'plant-photos/photo.jpg' };
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
    const uploadTask = {
      snapshot: { ref: storageRef },
      on: vi.fn(
        (
          _event: string,
          progressCallback: (snapshot: {
            bytesTransferred: number;
            totalBytes: number;
          }) => void,
          _errorCallback: (error: Error) => void,
          completeCallback: () => void,
        ) => {
          progressCallback({ bytesTransferred: 50, totalBytes: 100 });
          completeCallback();
        },
      ),
    };

    ref.mockReturnValue(storageRef);
    uploadBytesResumable.mockReturnValue(uploadTask);
    getDownloadURL.mockResolvedValue('https://example.com/photo.jpg');

    const { uploadPhoto } = await import('../storage');
    const onProgress = vi.fn();
    const url = await uploadPhoto(file, 'plant-photos/photo.jpg', onProgress);

    expect(url).toBe('https://example.com/photo.jpg');
    expect(ref).toHaveBeenCalledWith(mockStorage, 'plant-photos/photo.jpg');
    expect(uploadBytesResumable).toHaveBeenCalledWith(storageRef, file);
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(getDownloadURL).toHaveBeenCalledWith(storageRef);
  });

  it('deletePhoto calls deleteObject', async () => {
    const storageRef = { path: 'plant-photos/photo.jpg' };
    ref.mockReturnValue(storageRef);
    deleteObject.mockResolvedValue(undefined);

    const { deletePhoto } = await import('../storage');
    await deletePhoto('plant-photos/photo.jpg');

    expect(ref).toHaveBeenCalledWith(mockStorage, 'plant-photos/photo.jpg');
    expect(deleteObject).toHaveBeenCalledWith(storageRef);
  });
});
