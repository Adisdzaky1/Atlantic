const express = require('express');
const path = require('path');
const cloudscraper = require('cloudscraper');

const app = express();

// Setup views untuk dokumentasi
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware untuk parsing body (x-www-form-urlencoded dan JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Halaman dokumentasi
app.get('/', (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    res.render('index', { baseUrl });
});

// Fungsi untuk meneruskan request ke Atlantic menggunakan cloudscraper
async function forwardRequest(req, res, endpoint) {
    try {
        const requestData = req.body; // Data dari request client

        // Kirim POST dengan cloudscraper (otomatis menangani form-urlencoded)
        const response = await cloudscraper.post(`https://atlantich2h.com/${endpoint}`, {
            form: requestData, // Cloudscraper akan mengubah ke form-urlencoded
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 30000 // 30 detik
        });

        // Coba parse sebagai JSON, jika gagal kirim sebagai teks biasa
        try {
            const json = JSON.parse(response);
            res.json(json);
        } catch {
            res.send(response);
        }
    } catch (error) {
        console.error('Cloudscraper error:', error);

        // Jika ada respons error dari Atlantic (misal 4xx/5xx)
        if (error.response && error.response.body) {
            const status = error.response.statusCode || 500;
            try {
                const errorJson = JSON.parse(error.response.body);
                res.status(status).json(errorJson);
            } catch {
                res.status(status).send(error.response.body);
            }
        } else {
            // Error internal (network, timeout, dll)
            res.status(500).json({
                status: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

// Daftar endpoint yang akan diproxy (sesuai file example)
const endpoints = [
    'deposit/create',
    'deposit/status',
    'deposit/metode',
    'transaksi/create',
    'transaksi/status'
];

// Buat route POST untuk setiap endpoint
endpoints.forEach(endpoint => {
    app.post(`/${endpoint}`, (req, res) => forwardRequest(req, res, endpoint));
});

// Export untuk Vercel
module.exports = app;
