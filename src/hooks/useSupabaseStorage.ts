import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface UseSupabaseStorageResult {
  uploadFile: (file: File, bucket: string, folder?: string) => Promise<string | null>;
  deleteFile: (filePath: string, bucket: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useSupabaseStorage = (): UseSupabaseStorageResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, bucket: string, folder: string = 'public'): Promise<string | null> => {
    setLoading(true);
    setError(null);

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        toast.success('File uploaded successfully!');
        return publicUrlData.publicUrl;
      } else {
        throw new Error('Failed to get public URL after upload.');
      }
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file.');
      toast.error(`Failed to upload file: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (filePath: string, bucket: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      toast.success('File deleted successfully!');
      return true;
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'Failed to delete file.');
      toast.error(`Failed to delete file: ${err.message || 'Unknown error'}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { uploadFile, deleteFile, loading, error };
};