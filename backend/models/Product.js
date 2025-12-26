import { DataTypes } from 'sequelize';
import { sequelize } from '../configuration/Db.js'; 

const Product = sequelize.define('Product', {
  barcode: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  stockQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  soldQuantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, defaultValue: null }
}, { timestamps: false });

export default Product;
