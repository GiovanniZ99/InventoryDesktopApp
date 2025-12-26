const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

router.post('/register-or-sell-product', async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode is required' });

  try {
    const result = await productService.registerOrSellProduct(barcode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { page = 0, size = 10 } = req.query;

  try {
    const result = await productService.getAllProducts(
      parseInt(page),
      parseInt(size)
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search/by-name', async (req, res) => {
  const { name, page = 0, size = 10 } = req.query;

  if (!name) return res.status(400).json({ error: 'Name query parameter is required' });

  try {
    const result = await productService.getProductByName(
      name,
      parseInt(page),
      parseInt(size)
    );
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.get('/search/by-barcode/:barcode', async (req, res) => {
  const { barcode } = req.params;

  try {
    const product = await productService.getProductByBarcode(barcode);
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const result = await productService.addNamePriceStockQuantityProduct(req.body);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.put('/decrease/:barcode', async (req, res) => {
  try {
    const result = await productService.decreaseQuantity(req.params.barcode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:barcode', async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.barcode);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
