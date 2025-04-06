const express = require('express');
const multer = require('multer');
const cors = require('cors');
const qr = require('qr-image');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const os = require('os');

// Get local Wi-Fi IP
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal && config.address.startsWith('192.168')) {
                return config.address;
            }
        }
    }
    return 'localhost'; // fallback
}

const LOCAL_IP = getLocalIPAddress();


app.use(cors());
// Serve uploaded files for viewing (read-only access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('public/qr_codes')) fs.mkdirSync('public/qr_codes');

// Redirect root
app.get('/', (req, res) => {
    res.redirect('/vendor');
});

app.get('/vendor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vendor.html'));
});

// Multer storage: One folder per session
let sessionFolders = {}; // Track per vendor's active session

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const vendorId = req.params.vendorId;

        if (!sessionFolders[vendorId]) {
            const now = new Date();
            const date = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
            const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // "HH-MM-SS"
            const sessionFolderName = `session_${date}_${time}`;
            const sessionPath = path.join(__dirname, 'uploads', vendorId, sessionFolderName);
            fs.mkdirSync(sessionPath, { recursive: true });
            sessionFolders[vendorId] = sessionPath;
        }

        cb(null, sessionFolders[vendorId]);
    },
    filename: function (req, file, cb) {
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // "HH-MM-SS"
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${date}_${time}_${safeName}`);
    }
});
const upload = multer({ storage: storage });

/**
 * Generate QR for a vendor
 */
app.get('/generate-qr/:vendorId', (req, res) => {
    const vendorId = req.params.vendorId;
    const qrCodeData = `http://192.168.236.91:3000/user.html?vendorId=${vendorId}`;
    const qrPath = `public/qr_codes/vendor_${vendorId}.png`;
    const qrCode = qr.image(qrCodeData, { type: 'png' });
    qrCode.pipe(fs.createWriteStream(qrPath));
    res.sendFile(path.join(__dirname, qrPath));
});

/**
 * Upload multiple files to one folder
 */
app.post('/upload/:vendorId', upload.array('files', 10), (req, res) => {
    const vendorId = req.params.vendorId;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => {
        const relativePath = file.path.replace(__dirname, '').replace(/\\/g, '/');
        return relativePath.startsWith('/') ? relativePath : '/' + relativePath;
    });

    const dataFile = 'data.json';
    let data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : {};
    if (!data[vendorId]) data[vendorId] = [];
    data[vendorId].push(...uploadedFiles);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

    // Clear session folder for next upload
    delete sessionFolders[vendorId];

    res.json({ message: 'Files uploaded successfully', files: uploadedFiles });
});

/**
 * Fetch uploaded documents for vendor
 */
app.get('/documents/:vendorId', (req, res) => {
    const vendorId = req.params.vendorId;
    const dataFile = `data.json`;
    let data = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile)) : {};
    res.json({ documents: data[vendorId] || [] });
});

/**
 * Auto-delete expired files and empty folders
 */
setInterval(() => {
    const dataFile = 'data.json';
    if (!fs.existsSync(dataFile)) return;

    let data = JSON.parse(fs.readFileSync(dataFile));
    const now = Date.now();

    for (const vendorId in data) {
        data[vendorId] = data[vendorId].filter(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > 15 * 60 * 1000) {
                    fs.unlinkSync(filePath);
                    // Check and delete parent folder if empty
                    const folder = path.dirname(filePath);
                    if (fs.existsSync(folder) && fs.readdirSync(folder).length === 0) {
                        fs.rmdirSync(folder);
                    }
                    return false;
                }
            }
            return true;
        });
    }

    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}, 5 * 60 * 1000);

/**
 * Start Server
 */
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
