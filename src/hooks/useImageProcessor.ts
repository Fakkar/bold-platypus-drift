import { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface UseImageProcessorResult {
  compressAndResizeImage: (file: File) => Promise<File | null>;
  loading: boolean;
  error: string | null;
}

export const useImageProcessor = (): UseImageProcessorResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const compressAndResizeImage = async (file: File): Promise<File | null> => {
    setLoading(true);
    setError(null);

    const options = {
      maxSizeMB: 1, // (max file size in MB)
      maxWidthOrHeight: 800, // max width or height in pixels
      useWebWorker: true,
      fileType: 'image/webp', // Convert to webp for better compression and modern format
    };

    try {
      const compressedFile = await imageCompression(file, options);
      toast.success(t('image_processed_successfully'));
      return compressedFile;
    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(err.message || t('failed_to_process_image'));
      toast.error(`${t('failed_to_process_image')}: ${err.message || t('unknown_error')}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { compressAndResizeImage, loading, error };
};