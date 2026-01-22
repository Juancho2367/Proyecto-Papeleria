const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private/Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('category', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { barcode, name, category, costPrice, salePrice, stock, minStockThreshold } = req.body;
    
    // Check if product exists
    const productExists = await Product.findOne({ barcode });
    if (productExists) {
      return res.status(400).json({ message: 'Product already exists with this barcode' });
    }

    const product = new Product({
      barcode,
      name,
      category,
      costPrice,
      salePrice,
      stock,
      minStockThreshold
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, costPrice, salePrice, stock, minStockThreshold, barcode } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.category = category || product.category;
      product.costPrice = costPrice || product.costPrice;
      product.salePrice = salePrice || product.salePrice;
      product.stock = stock !== undefined ? stock : product.stock;
      product.minStockThreshold = minStockThreshold || product.minStockThreshold;
      product.barcode = barcode || product.barcode;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};