
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (file: File | null) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogoUrl, onLogoChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);

  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Check file size - limit to 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds the 2MB limit");
        return;
      }

      // Check file type - allow only images
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
      onLogoChange(file);
    }
  };

  const handleClearLogo = () => {
    setPreviewUrl(null);
    onLogoChange(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {previewUrl ? (
        <div className="relative w-32 h-32">
          <img 
            src={previewUrl} 
            alt="Company logo preview" 
            className="w-full h-full object-contain border rounded-md"
          />
          <button 
            onClick={handleClearLogo}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
          <Upload className="text-gray-400" />
        </div>
      )}
      
      <div className="flex gap-2">
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('logo')?.click()}
        >
          {previewUrl ? 'Change Logo' : 'Upload Logo'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Upload your company logo. Max size: 2MB. PNG or JPG format.
      </p>
    </div>
  );
};

export default LogoUpload;
