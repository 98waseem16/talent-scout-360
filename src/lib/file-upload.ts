
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from '@supabase/supabase-js';

export type FileUploadOptions = {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeInMB?: number;
  quality?: number;
};

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param bucketName The bucket to upload to
 * @param options Options for resizing and compressing the image
 * @returns The public URL of the uploaded file
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
  options?: FileUploadOptions
): Promise<string> => {
  const { maxWidth = 400, maxHeight = 400, maxSizeInMB = 2, quality = 0.8 } = options || {};
  
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    throw new Error(`File size exceeds the maximum allowed size of ${maxSizeInMB}MB`);
  }

  // For images, resize and compress before uploading
  let fileToUpload = file;
  if (file.type.startsWith('image/')) {
    try {
      fileToUpload = await resizeAndCompressImage(file, { maxWidth, maxHeight, quality });
    } catch (error) {
      console.error('Error resizing image:', error);
      // Continue with the original file if resizing fails
    }
  }

  // Generate a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Upload the file to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrl;
};

/**
 * Resizes and compresses an image
 */
const resizeAndCompressImage = async (
  file: File,
  options: { maxWidth: number; maxHeight: number; quality: number }
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const { maxWidth, maxHeight, quality } = options;
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(newFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};
