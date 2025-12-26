const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { MongoClient } = require('mongodb');

// === Percorsi base ===
const isPackaged = app.isPackaged;
const basePath = isPackaged ? process.resourcesPath : path.join(__dirname);

const mongodBin = path.join(basePath, 'mongodb', 'bin', 'mongod.exe');
const dataPath = path.join(basePath, 'mongodb', 'data');
const mongoLogPath = path.join(app.getPath('userData'), 'mongod.log');
const javaExecutable = path.join(basePath, 'jdk-21.0.8+9-jre', 'bin', 'java.exe');
const backendJar = path.join(basePath, 'backend', 'warehouse.jar');

let mongoProcess = null;
let javaProcess = null;
let servicesReady = { mongo: false, backend: false };

// === Timeout e retry ===
const STARTUP_TIMEOUT = 15000; 
const CONNECTION_RETRY_DELAY = 1000; 

function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', function () {
        tester.once('close', () => resolve(false)).close();
      })
      .listen(port);
  });
}

// === Attesa che MongoDB risponda ===
function waitForMongoReady() {
  return new Promise((resolve) => {
    const tryConnect = async () => {
      const url = 'mongodb://localhost:27017';
      const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000
      });

      try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        client.close();
        console.log('MongoDB pronto');
        resolve();
      } catch (err) {
        console.log(`MongoDB non ancora pronto: ${err.message}`);
        client.close();
        setTimeout(tryConnect, CONNECTION_RETRY_DELAY);
      }
    };
    tryConnect();
  });
}

// === Avvio MongoDB sequenziale ===
async function startMongoDB() {
  if (await isPortInUse(27017)) {
    console.log('MongoDB già in esecuzione');
    servicesReady.mongo = true;
    return;
  }

  fs.mkdirSync(dataPath, { recursive: true });
  fs.mkdirSync(path.dirname(mongoLogPath), { recursive: true });

  const mongoArgs = [
    '--dbpath', dataPath,
    '--port', '27017',
    '--logpath', mongoLogPath,
    '--quiet'
  ];

  console.log('Avvio MongoDB...');
  mongoProcess = spawn(mongodBin, mongoArgs);

  mongoProcess.stdout.on('data', data => {
    console.log(`[MongoDB] ${data}`);
  });

  mongoProcess.stderr.on('data', data => {
    console.error(`[MongoDB ERR] ${data}`);
  });

  mongoProcess.on('error', err => {
    console.error('Errore MongoDB:', err);
  });

  await waitForMongoReady();
  servicesReady.mongo = true;
}

// === Avvio Backend ===
async function startBackend() {
  if (await isPortInUse(8080)) {
    console.log('Backend già in esecuzione');
    servicesReady.backend = true;
    return;
  }

  console.log('Avvio Backend Java...');
  
  const javaArgs = [
    '-Xms256m',
    '-Xmx512m',
    '-XX:+UseG1GC',
    '-XX:+UseStringDeduplication',
    '-Dspring.profiles.active=prod',
    '-Dserver.port=8080',
    '-jar', backendJar
  ];

  javaProcess = spawn(javaExecutable, javaArgs, {
    cwd: path.dirname(backendJar)
  });

  return new Promise((resolve) => {
    javaProcess.stdout.on('data', data => {
      const output = data.toString();
      console.log(`[Backend] ${output}`);
      if (output.includes('Started WarehouseApplication')) {
        console.log('Backend pronto');
        servicesReady.backend = true;
        resolve();
      }
    });

    javaProcess.stderr.on('data', data => {
      console.error(`[Backend ERR] ${data}`);
    });

    javaProcess.on('error', err => {
      console.error('Errore Backend:', err);
    });
  });
}

// === Avvio sequenziale dei servizi ===
async function startServices() {
  console.log('Avvio servizi in sequenza...');
  try {
    await startMongoDB();
    await startBackend();
    console.log('Tutti i servizi pronti!');
    createWindow();
  } catch (err) {
    console.error('Errore durante avvio servizi:', err);
    createWindow(); 
  }

  setTimeout(() => {
    if (!servicesReady.mongo || !servicesReady.backend) {
      console.log('Timeout avvio servizi, creo finestra comunque...');
      createWindow();
    }
  }, STARTUP_TIMEOUT);
}

function getAssetPath(...paths) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'frontend', 'assets', ...paths);
  } else {
    return path.join(__dirname, 'assets', ...paths);
  }
}

// === Crea finestra principale ===
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: getAssetPath('barcode.ico'),
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      backgroundThrottling: false
    }
  });

  win.once('ready-to-show', () => {
    win.show();
    console.log('Applicazione pronta!');
  });

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline';",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
          "font-src 'self' https://fonts.gstatic.com;",
          "img-src 'self' data:;",
          "connect-src 'self' http://localhost:8080;"
        ].join(' ')
      }
    });
  });

  if (isPackaged) {
    const frontendPath = path.join(basePath, 'frontend', 'index.html');
    win.loadFile(frontendPath);
  } else {
    win.loadURL('http://localhost:4200');
  }
}

// === Chiusura ordinata processi ===
function waitForProcessClose(proc, name, timeout = 3000) {
  return new Promise((resolve) => {
    if (!proc) {
      resolve();
      return;
    }

    let finished = false;

    proc.on('close', (code, signal) => {
      if (!finished) {
        finished = true;
        console.log(`${name} terminato con codice ${code}, segnale ${signal}`);
        resolve();
      }
    });

    setTimeout(() => {
      if (!finished) {
        console.warn(`${name} non risponde, forzo kill...`);
        proc.kill('SIGKILL');
        resolve();
      }
    }, timeout);
  });
}

app.on('window-all-closed', async () => {
  console.log('Chiusura finestre: arresto servizi...');

  if (javaProcess) {
    javaProcess.kill('SIGTERM');
    await waitForProcessClose(javaProcess, 'Backend Java');
  }

  if (mongoProcess) {
    try {
      console.log('Arresto MongoDB...');
      mongoProcess.kill('SIGTERM');
      await waitForProcessClose(mongoProcess, 'MongoDB');
      console.log('MongoDB arrestato.');
    } catch (err) {
      console.error('Errore durante l\'arresto di MongoDB:', err.message);
      mongoProcess.kill('SIGKILL');
      await waitForProcessClose(mongoProcess, 'MongoDB');
    }
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(startServices);
