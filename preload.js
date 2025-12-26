const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAllProducts: (page, size) =>
    ipcRenderer.invoke('get-all-products', page, size),

  getProductByName: (name, page, size) =>
    ipcRenderer.invoke('get-product-by-name', name, page, size),

  getProductByBarcode: (barcode) =>
    ipcRenderer.invoke('get-product-by-barcode', barcode),

  registerOrSellProduct: (barcode) =>
    ipcRenderer.invoke('register-or-sell-product', barcode),

  updateProduct: (product) =>
    ipcRenderer.invoke('update-product', product),

  decreaseQuantity: (barcode) =>
    ipcRenderer.invoke('decrease-quantity', barcode),

  deleteProduct: (barcode) =>
    ipcRenderer.invoke('delete-product', barcode)
});
