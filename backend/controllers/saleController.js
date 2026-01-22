const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({}).populate('seller', 'name').sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // req.user.id viene del middleware auth
    const sellerId = req.user.id;
    const { products, paymentMethod, cashReceived } = req.body;
    
    let totalAmount = 0;
    const productsToSave = [];

    // 1. Validar stock y calcular total
    for (const item of products) {
      // item debe tener { productId, quantity }
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        throw new Error(`Producto no encontrado ID: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para: ${product.name}. Stock actual: ${product.stock}`);
      }

      // Restar stock
      product.stock -= item.quantity;
      await product.save({ session });

      const subtotal = product.salePrice * item.quantity;
      totalAmount += subtotal;

      productsToSave.push({
        product: product._id,
        quantity: item.quantity,
        priceAtSale: product.salePrice,
        subtotal
      });
    }

    // 2. Calcular Cambio (Backend verification)
    let changeGiven = 0;
    if (paymentMethod === 'cash') {
      if (cashReceived < totalAmount) {
        throw new Error('El dinero recibido es insuficiente');
      }
      changeGiven = cashReceived - totalAmount;
    }

    // 3. Crear Venta
    const sale = new Sale({
      seller: sellerId,
      products: productsToSave,
      totalAmount,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
      changeGiven: paymentMethod === 'cash' ? changeGiven : undefined
    });

    await sale.save({ session });
    await session.commitTransaction();

    res.status(201).json({ success: true, data: sale });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};