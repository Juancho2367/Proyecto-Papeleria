import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { DollarSign, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirmPayment: (method: 'cash' | 'transfer', cashReceived?: number, change?: number) => void;
}

export function PaymentModal({ isOpen, onClose, totalAmount, onConfirmPayment }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [change, setChange] = useState<number>(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('cash');
      setCashReceived('');
      setChange(0);
    }
  }, [isOpen]);

  // Calculate change automatically
  useEffect(() => {
    if (cashReceived) {
      const received = parseFloat(cashReceived);
      if (!isNaN(received)) {
        setChange(received - totalAmount);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [cashReceived, totalAmount]);

  const handleConfirm = () => {
    if (paymentMethod === 'cash') {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < totalAmount) {
        return; // Validation handled by UI state usually, but safe guard here
      }
      onConfirmPayment('cash', received, change);
    } else {
      onConfirmPayment('transfer');
    }
    onClose();
  };

  const isCashInsufficient = paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < totalAmount);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Confirmar Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500 mb-1">Total a Pagar</p>
            <p className="text-4xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
          </div>

          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(val: 'cash' | 'transfer') => setPaymentMethod(val)}
            className="grid grid-cols-2 gap-4"
          >
            <div className={`flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${paymentMethod === 'cash' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center cursor-pointer font-medium">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" /> Efectivo
              </Label>
            </div>
            <div className={`flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${paymentMethod === 'transfer' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200'}`}>
              <RadioGroupItem value="transfer" id="transfer" />
              <Label htmlFor="transfer" className="flex items-center cursor-pointer font-medium">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" /> Transferencia
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'cash' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label htmlFor="cashReceived" className="text-base">Dinero Recibido</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    id="cashReceived"
                    type="number"
                    placeholder="0.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="pl-10 text-xl font-semibold h-12"
                    autoFocus
                  />
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-colors ${
                 change >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Cambio a Devolver:</span>
                  <span className={`text-2xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    ${change >= 0 ? change.toFixed(2) : '0.00'}
                  </span>
                </div>
                {change < 0 && (
                  <p className="text-xs text-red-500 mt-1 text-right">Faltan ${Math.abs(change).toFixed(2)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between gap-3">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-12 text-base">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isCashInsufficient}
            className="w-full sm:w-auto h-12 text-base bg-indigo-600 hover:bg-indigo-700"
          >
            Confirmar Venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
