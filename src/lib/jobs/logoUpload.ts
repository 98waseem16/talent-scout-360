
import { uploadFile } from '../file-upload';

/**
 * Uploads a company logo to Supabase storage
 */
export const uploadCompanyLogo = async (file: File): Promise<string> => {
  try {
    const publicUrl = await uploadFile(file, 'Company Logos', {
      maxWidth: 400,
      maxHeight: 400,
      maxSizeInMB: 2,
      quality: 0.8
    });
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    throw error;
  }
};
