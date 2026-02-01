
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, fileName: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-500 transition-colors bg-slate-800/50"
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 text-indigo-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Upload an image</h3>
        <p className="text-slate-400">Click to browse or drag and drop your photo here</p>
      </div>
    </div>
  );
};
