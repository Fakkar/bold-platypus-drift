import React from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 border-none bg-transparent shadow-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
          />
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 z-50"
              aria-label={t('close')}
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;