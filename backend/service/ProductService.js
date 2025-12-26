import Product from '../models/Product.js';
import { Op } from 'sequelize';

class ProductService {

  async registerOrSellProduct(barcode) {
    let product = await Product.findByPk(barcode);

    if (product) {
      product.soldQuantity += 1;
      await product.save();
    } else {
      product = await Product.create({
        barcode,
        createdAt: new Date() 
      });
      product = await Product.findByPk(barcode);
    }

    return product.get({ plain: true });
  }

  async getProductByName(name, page = 0, size = 10) {
    const products = await Product.findAndCountAll({
      where: { name: { [Op.like]: `%${name}%` } },
      limit: size,
      offset: page * size,
      order: [['createdAt', 'DESC']],
    });

    if (products.count === 0) throw new Error('Prodotto non trovato');

    return {
      content: products.rows.map(p => p.get({ plain: true })),
      page: {
        number: page,
        size,
        totalElements: products.count,
      }
    };
  }

  async getProductByBarcode(barcode) {
    const product = await Product.findByPk(barcode);
    if (!product) throw new Error('Prodotto non trovato');
    return product.get({ plain: true });
  }

  async getAllProducts(page = 0, size = 10) {
    const products = await Product.findAndCountAll({
      limit: size,
      offset: page * size,
      order: [['createdAt', 'DESC']],
    });

    return {
      content: products.rows.map(p => p.get({ plain: true })),
      page: {
        number: page,
        size,
        totalElements: products.count,
      }
    };
  }

  async addNamePriceStockQuantityProduct(productDTO) {
    const product = await Product.findByPk(productDTO.barcode);
    if (!product) throw new Error('Prodotto non trovato');

    product.name = productDTO.name;
    product.price = productDTO.price;
    product.stockQuantity = productDTO.stockQuantity;

    await product.save();
    return product.get({ plain: true });
  }

  async decreaseQuantity(barcode) {
    const product = await Product.findByPk(barcode);
    if (!product) throw new Error('Prodotto non trovato');

    if (product.soldQuantity === 0)
      throw new Error('La quantità venduta non può essere negativa');

    product.soldQuantity -= 1;
    await product.save();
    return product.get({ plain: true });
  }

  async deleteProduct(barcode) {
    const product = await Product.findByPk(barcode);
    if (!product) throw new Error('Prodotto non trovato');

    await product.destroy();
    return product.get({ plain: true });
  }

  async updateExistingProductsCreatedAt() {
    const products = await Product.findAll({ where: { createdAt: null } });
    const now = new Date();

    for (let product of products) {
      product.createdAt = now;
      await product.save();
    }
  }
}

export default new ProductService();
