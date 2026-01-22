import React, { useState, useEffect } from 'react';
import { useApp, type Product } from '@/app/contexts/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { BarcodeScanner } from '@/app/components/BarcodeScanner';
import { PaymentModal } from '@/app/components/PaymentModal';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface CartItem extends Product {
  quantity: number;
}

export function Sales() {
  const { products, addSale, getProductByBarcode } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
      }
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('Producto sin stock');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('No hay suficiente stock');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success('Producto agregado al carrito');
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (!product || !cartItem) return;

    const newQuantity = cartItem.quantity + delta;
    
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else if (newQuantity > product.stock) {
      toast.error('No hay suficiente stock');
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.success('Producto eliminado del carrito');
  };

  const handleBarcodeScanned = (barcode: string) => {
    const product = getProductByBarcode(barcode);
    if (product) {
      addToCart(product);
    } else {
      toast.error('Producto no encontrado');
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleConfirmPayment = async (method: 'cash' | 'transfer', cashReceived?: number, change?: number) => {
    try {
      const sale = {
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: method,
        ...(method === 'cash' && {
          cashReceived: cashReceived,
          change: change
        }),
      };

      await addSale(sale);
      setCart([]);
      localStorage.removeItem('pos_cart');
      setIsPaymentModalOpen(false);
    } catch (error) {
      // Error handled in context
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center">
          <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 mr-3" />
          Realizar Venta
        </h1>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          <Card className="flex-1 flex flex-col shadow-lg overflow-hidden border-indigo-100">
            <CardHeader className="py-4 border-b bg-white z-10">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <BarcodeScanner onScan={handleBarcodeScanned} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`
                      flex flex-col h-full p-3 rounded-xl border-2 text-left transition-all duration-200 
                      hover:shadow-md active:scale-95 group relative overflow-hidden
                      ${product.stock === 0
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-white hover:border-indigo-500'
                      }
                    `}
                  >
                    <div className="flex-1 mb-2">
                      <h3 className="font-semibold text-slate-800 text-sm md:text-base leading-tight line-clamp-2 group-hover:text-indigo-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{product.category}</p>
                    </div>
                    
                    <div className="flex justify-between items-end w-full pt-2 border-t border-slate-100 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stock</span>
                        <span className={`text-sm font-bold ${
                          product.stock < product.minStock ? 'text-red-500' : 'text-slate-700'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-base md:text-lg font-bold text-emerald-600">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {/* Add overlay effect */}
                    <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section (Right Side on Desktop, Bottom on Mobile) */}
        <div className="lg:w-96 flex-shrink-0 flex flex-col gap-4 h-auto lg:h-full min-h-0">
          <Card className="flex-1 flex flex-col shadow-lg border-indigo-100 h-full overflow-hidden">
            <CardHeader className="py-4 border-b bg-indigo-50">
              <CardTitle className="text-lg flex justify-between items-center text-indigo-900">
                <span>Carrito</span>
                <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h4 className="font-medium text-sm text-slate-800 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <Button
                        onClick={() => removeFromCart(item.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 -mt-1 -mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 bg-slate-50 rounded-md p-0.5">
                        <Button
                          onClick={() => updateQuantity(item.id, -1)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          onClick={() => updateQuantity(item.id, 1)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="font-bold text-emerald-600">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            
            {/* Total Footer */}
            <div className="p-4 border-t bg-white space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium">Total</span>
                <span className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</span>
              </div>
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cart.length === 0}
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
              >
                Pagar Ahora
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}