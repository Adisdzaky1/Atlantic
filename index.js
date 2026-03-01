const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');

const app = express();

// Setup views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cors()); // Izinkan akses dari mana saja
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper untuk forward request ke Atlantic
async function forwardRequest(req, res, endpoint) {
    try {
        // Ambil semua data dari body (bisa dari x-www-form-urlencoded atau JSON)
        const bodyData = req.body;
        const headers = {
            'Content-Type': req.get('Content-Type') || 'application/x-www-form-urlencoded',
            // Anda bisa tambahkan header lain jika diperlukan
        };

        // Tentukan URL tujuan
        const targetUrl = `https://atlantich2h.com/${endpoint}`;

        // Pilih metode pengiriman sesuai content-type
        let response;
        if (headers['Content-Type'].includes('application/json')) {
            response = await axios.post(targetUrl, bodyData, { headers });
        } else {
            // Untuk form-urlencoded, gunakan qs
            const formData = qs.stringify(bodyData);
            response = await axios.post(targetUrl, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
        }

        // Kirim balik respons dari Atlantic
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            // Error dari Atlantic
            res.status(error.response.status).json(error.response.data);
        } else {
            // Error lain (network, dll)
            res.status(500).json({
                status: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

// Halaman dokumentasi
app.get('/', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.render('index', { baseUrl });
});

// ==================== ENDPOINT PROXY ====================

// Deposit
app.post('/deposit/create', (req, res) => forwardRequest(req, res, 'deposit/create'));
app.post('/deposit/status', (req, res) => forwardRequest(req, res, 'deposit/status'));
app.post('/deposit/metode', (req, res) => forwardRequest(req, res, 'deposit/metode'));

// Transaksi
app.post('/transaksi/create', (req, res) => forwardRequest(req, res, 'transaksi/create'));
app.post('/transaksi/status', (req, res) => forwardRequest(req, res, 'transaksi/status'));

// Export untuk Vercel
module.exports = app;
