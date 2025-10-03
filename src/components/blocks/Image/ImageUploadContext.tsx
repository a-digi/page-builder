// path: src/components/page-builder/components/blocks/Image/ImageUploadContext.tsx
import { createContext, useContext, type ReactNode } from 'react';

export interface IImageUploadContext {
  onImageSelect?: (file: File) => Promise<string>;
}

const ImageUploadContext = createContext<IImageUploadContext | undefined>(undefined);

export const useImageUploadContext = (): IImageUploadContext => {
  return useContext(ImageUploadContext) ?? {};
};

interface ImageUploadProviderProps {
  children: ReactNode;
  onImageSelect: (file: File) => Promise<string>;
}

export const ImageUploadProvider = ({ children, onImageSelect }: ImageUploadProviderProps) => {
  return (
    <ImageUploadContext.Provider value={{ onImageSelect }}>
      {children}
    </ImageUploadContext.Provider>
  );
};
