import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('barcode-reader');
      setScanner(html5QrCode);
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore errors during scanning
        }
      );
      
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const stopScanning = () => {
    if (scanner && isScanning) {
      scanner.stop().then(() => {
        setIsScanning(false);
        setIsOpen(false);
      }).catch(console.error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  const handleClose = () => {
    stopScanning();
  };

  return (
    <>
      <Button onClick={handleOpen} variant="outline" size="lg" className="h-12">
        <Camera className="w-5 h-5 mr-2" />
        Escanear Código
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Escanear Código de Barras</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div 
              id="barcode-reader" 
              className="w-full rounded-lg overflow-hidden bg-black"
              style={{ minHeight: '300px' }}
            />
            <p className="text-sm text-center text-slate-600">
              Coloca el código de barras dentro del recuadro
            </p>
            <Button onClick={handleClose} variant="outline" className="w-full h-12">
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
