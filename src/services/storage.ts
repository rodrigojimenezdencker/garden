import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../lib/constants';
import { storage } from '../lib/firebase';

const FILE_SIZE_ERROR = 'El archivo excede el tamaño máximo de 5MB';
const FILE_TYPE_ERROR =
  'Tipo de archivo no permitido. Use JPEG, PNG, WebP o GIF';

export const uploadPhoto = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(FILE_SIZE_ERROR);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(FILE_TYPE_ERROR);
  }

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (!onProgress) {
          return;
        }

        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};

export const deletePhoto = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};
