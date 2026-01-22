import React, { useState } from 'react';
import { useApp } from '@/app/contexts/AppContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { BarcodeScanner } from '@/app/components/BarcodeScanner';
import { Package, Plus, Edit2, Trash2, Search, AlertTriangle, Settings2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/app/contexts/AppContext';

export function Inventory() {
  const { products, categories, addProduct, updateProduct, deleteProduct, user, addCategory, removeCategory } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  
  // Category Form
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    description: '',
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.barcode.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          barcode: formData.barcode,
          category: formData.category,
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice || '0'),
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
          description: formData.description,
        });
      } else {
        await addProduct({
          name: formData.name,
          barcode: formData.barcode,
          category: formData.category,
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice || '0'),
          stock: parseInt(formData.stock),
          minStock: parseInt(formData.minStock),
          description: formData.description,
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      // Toast handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      await addCategory(newCategoryName);
      setNewCategoryName('');
    } catch (error) {
      // Handled in context
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: typeof product.category === 'string' ? product.category : 'Otros',
      price: product.price.toString(),
      costPrice: (product.costPrice || 0).toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      description: product.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: '',
      category: '',
      price: '',
      costPrice: '',
      stock: '',
      minStock: '',
      description: '',
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    toast.success(`Código escaneado: ${barcode}`);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Product List Header */}
        <div className="flex-1 w-full lg:w-auto">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center">
            <Package className="w-10 h-10 mr-3" />
            Inventario
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            {products.length} productos en total
          </p>
        </div>
        
        {/* Actions - Visible for Admin AND Worker (Create only) */}
        <div className="flex gap-3 w-full lg:w-auto">
          {isAdmin && (
            <Button 
              onClick={() => setIsCategoryDialogOpen(true)} 
              variant="outline" 
              size="lg" 
              className="h-12 flex-1 lg:flex-none"
            >
              <Settings2 className="w-5 h-5 mr-2" />
              Gestionar Categorías
            </Button>
          )}
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            size="lg" 
            className="h-12 flex-1 lg:flex-none"
          >
            <Plus className="w-5 h-5 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`shadow-lg hover:shadow-xl transition-all ${
              product.stock < product.minStock ? 'border-l-4 border-l-red-500' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {typeof product.category === 'string' ? product.category : 'General'}
                </span>
                {product.stock < product.minStock && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Precio:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Stock:</span>
                  <span className={`font-bold text-lg ${
                    product.stock < product.minStock ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {product.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Código:</span>
                  <span className="text-xs font-mono text-slate-700">{product.barcode}</span>
                </div>
              </div>
              
              {/* Admin Actions (Edit/Delete) */}
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barcode">Código de Barras *</Label>
                <div className="flex gap-2">
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    required
                    className="h-12 text-lg flex-1"
                  />
                  <BarcodeScanner onScan={handleBarcodeScanned} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio Venta *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Costo (Opcional)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Actual *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  required
                  className="h-12 text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (Opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-12 text-lg"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="h-12">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="h-12">
                {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Agregar')} Producto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Categorías</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New */}
            <form onSubmit={handleCreateCategory} className="flex gap-2 items-end">
              <div className="space-y-2 flex-1">
                <Label htmlFor="newCategory">Nueva Categoría</Label>
                <Input
                  id="newCategory"
                  placeholder="Ej. Oficina"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button type="submit" className="h-10" disabled={!newCategoryName.trim()}>
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </form>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Categorías Existentes</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No hay categorías registradas</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <Button 
                        onClick={() => removeCategory(cat.id)}
                        variant="ghost" 
                        size="sm"
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}