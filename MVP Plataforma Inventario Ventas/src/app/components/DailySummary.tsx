import { useState } from 'react';
import { useApp, type Sale } from '@/app/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { CalendarDays, User, DollarSign, CreditCard, ShoppingBag, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkerStats {
  id: string;
  name: string;
  totalSales: number;
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  sales: Sale[];
}

export function DailySummary() {
  const { sales } = useApp();
  const [selectedWorker, setSelectedWorker] = useState<WorkerStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter sales for selected date
  const getSelectedDateSales = () => {
    return sales.filter(s => new Date(s.date).toDateString() === selectedDate.toDateString());
  };

  const filteredSales = getSelectedDateSales();

  // Group sales by worker
  const getWorkerStats = (): WorkerStats[] => {
    const statsMap = new Map<string, WorkerStats>();

    filteredSales.forEach(sale => {
      const workerId = sale.workerId || 'unknown';
      const workerName = sale.workerName || 'Desconocido';

      if (!statsMap.has(workerId)) {
        statsMap.set(workerId, {
          id: workerId,
          name: workerName,
          totalSales: 0,
          totalAmount: 0,
          cashAmount: 0,
          transferAmount: 0,
          sales: []
        });
      }

      const stats = statsMap.get(workerId)!;
      stats.totalSales += 1;
      stats.totalAmount += sale.total;
      stats.sales.push(sale);

      if (sale.paymentMethod === 'cash') {
        stats.cashAmount += sale.total;
      } else {
        stats.transferAmount += sale.total;
      }
    });

    return Array.from(statsMap.values());
  };

  const workerStats = getWorkerStats();
  const totalDailyRevenue = workerStats.reduce((sum, w) => sum + w.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center">
            <CalendarDays className="w-10 h-10 mr-3 text-indigo-600" />
            Resumen Diario
          </h1>
          <div className="flex items-center mt-2 gap-3">
             <p className="text-slate-600 text-lg">
                Ventas del:
             </p>
             <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 text-lg font-medium border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Card className="bg-indigo-600 text-white border-none shadow-lg">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-indigo-100 text-sm font-medium">Venta Total</p>
              <p className="text-2xl font-bold">${totalDailyRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Grid */}
      {workerStats.length === 0 ? (
        <Card className="bg-slate-50 border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-700">No hay ventas registradas</h3>
            <p className="text-slate-500 mt-1">
              No se encontraron ventas para el día <span className="font-semibold">{format(selectedDate, "dd/MM/yyyy")}</span>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workerStats.map((worker) => (
            <Card 
              key={worker.id}
              className="cursor-pointer transition-all hover:shadow-xl hover:border-indigo-300 group"
              onClick={() => setSelectedWorker(worker)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-slate-700 flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-full text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  {worker.name}
                </CardTitle>
                <Button variant="ghost" size="icon" className="text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-4 bg-slate-50 rounded-lg group-hover:bg-indigo-50/50 transition-colors">
                    <p className="text-3xl font-bold text-slate-900">${worker.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Total Vendido</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Transacciones</span>
                      <span className="font-medium text-slate-900">{worker.totalSales}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Efectivo</span>
                      <span className="font-medium text-green-600">${worker.cashAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-600" />
              Detalle de Ventas: {selectedWorker?.name}
            </DialogTitle>
             <CardDescription className="ml-8">
                {format(selectedDate, "PPPP", { locale: es })}
             </CardDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 p-3 rounded-lg border text-center">
              <p className="text-xs text-slate-500 mb-1">Total Generado</p>
              <p className="text-xl font-bold text-slate-900">${selectedWorker?.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
              <p className="text-xs text-green-600 mb-1">Efectivo</p>
              <p className="text-xl font-bold text-green-700">${selectedWorker?.cashAmount.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-600 mb-1">Transferencia</p>
              <p className="text-xl font-bold text-blue-700">${selectedWorker?.transferAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Historial de Transacciones ({selectedWorker?.sales.length})
            </h4>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {selectedWorker?.sales.slice().reverse().map((sale) => (
                  <div key={sale.id} className="p-4 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(sale.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-slate-500">
                          {sale.products.length} producto(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">${sale.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          sale.paymentMethod === 'cash' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {sale.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Products summary */}
                    <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded mt-2">
                      <p className="text-xs font-medium text-slate-400 mb-1">Productos:</p>
                      <ul className="list-disc list-inside">
                        {sale.products.map((p, idx) => {
                          return (
                            <li key={idx} className="truncate">
                                {p.quantity}x {p.productName || 'Producto'} (${p.price})
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}