
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Check, X } from 'lucide-react';
import { uploadCompanyLogo } from '@/lib/jobs';
import { toast } from 'sonner';

interface LogoUploadProps {
  onLogoChange: (logoUrl: string) => void;
  initialLogo?: string;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onLogoChange, initialLogo = '/placeholder.svg' }) => {
  const [logo, setLogo] = useState<string>(initialLogo);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept image files
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, etc.)');
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      console.log("Uploading logo:", file.name);
      const logoUrl = await uploadCompanyLogo(file);
      console.log("Logo uploaded successfully:", logoUrl);
      setLogo(logoUrl);
      onLogoChange(logoUrl);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError((error as Error).message || 'Failed to upload logo');
      toast.error('Failed to upload logo');
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogo('/placeholder.svg');
    onLogoChange('/placeholder.svg');
    toast.success('Logo removed');
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img 
            src={logo} 
            alt="Company logo" 
            className="w-32 h-32 object-contain rounded-md border border-gray-200 bg-gray-50"
            onError={(e) => {
              console.log("Error loading image, using placeholder");
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          {logo !== '/placeholder.svg' && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove logo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          type="button" 
          variant="outline" 
          className="w-full cursor-pointer"
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : logo === '/placeholder.svg' ? (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Logo
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Change Logo
            </span>
          )}
        </Button>
        <input
          id="logo-upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-gray-500">
          Upload a company logo (max 2MB). The image will be resized to a maximum of 400x400 pixels.
        </p>
      </div>
    </div>
  );
};

export default LogoUpload;
