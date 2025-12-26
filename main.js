import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import productService from './backend/service/ProductService.js';
import { initDb } from './backend/configuration/Db.js';

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    icon: path.join(__dirname, 'assets', 'barcode.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Applicazione pronta!');
  });

  if (app.isPackaged) {
    mainWindow.loadFile(
      path.join(process.resourcesPath, 'frontend', 'index.html')
    );
  } else {
    mainWindow.loadURL('http://localhost:4200');
  }
}

// Funzione helper per async IPC handlers
function asyncHandler(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error('Errore IPC:', err);
      throw err;
    }
  };
}

// IPC handlers

ipcMain.handle('register-or-sell-product', asyncHandler((_, barcode) =>
  productService.registerOrSellProduct(barcode)  
));

ipcMain.handle('get-all-products', asyncHandler((_, page, size) =>
  productService.getAllProducts(page, size)
));

ipcMain.handle('get-product-by-name', asyncHandler((_, name, page, size) =>
  productService.getProductByName(name, page, size) 
));

ipcMain.handle('get-product-by-barcode', asyncHandler((_, barcode) =>
  productService.getProductByBarcode(barcode)
));


ipcMain.handle('update-product', asyncHandler((_, product) =>
  productService.addNamePriceStockQuantityProduct(product)
));

ipcMain.handle('decrease-quantity', asyncHandler((_, barcode) =>
  productService.decreaseQuantity(barcode)
));

ipcMain.handle('delete-product', asyncHandler((_, barcode) =>
  productService.deleteProduct(barcode)  
));


// App lifecycle
app.whenReady().then(async () => {
  // Inizializza database e crea tabelle se non esistono
  await initDb();

  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
