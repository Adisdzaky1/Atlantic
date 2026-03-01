const express = require('express');
const path = require('path');
const axios = require('axios');
const qs = require('qs');

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

// Fungsi untuk meneruskan request ke Atlantic
async function forwardRequest(req, res, endpoint) {
    try {
        // Data dari request body (sudah di-parse oleh express)
        const requestData = req.body;

        // Stringify data menggunakan qs (seperti di contoh)
        const formData = qs.stringify(requestData);

        // Kirim POST ke Atlantic
        const response = await axios.post(`https://atlantich2h.com/${endpoint}`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // Kirim respons dari Atlantic ke client (tanpa perubahan)
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            // Ada respons error dari Atlantic (misal 400, 401, dll)
            res.status(error.response.status).json(error.response.data);
        } else {
            // Error lain (koneksi, timeout, dll)
            res.status(500).json({
                status: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    }
}

// Daftar endpoint yang akan diproxy (sesuai dengan file example)
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
