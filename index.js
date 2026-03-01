const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

// Helper untuk response
function baseResponse(status, data, code, message) {
  const response = { status, code };
  if (message) response.message = message;
  if (data) response.data = data;
  return response;
}

// Halaman dokumentasi
app.get('/', (req, res) => {
  res.render('index', { baseUrl: 'https://atlantic-api-docs.vercel.app' });
});

// ==================== DEPOSIT ====================

// Create Deposit
app.post('/deposit/create', (req, res) => {
  const { reff_id, nominal } = req.body;
  const id = uuidv4();
  const now = moment();
  const expired = moment().add(1, 'hour');
  const data = {
    id,
    reff_id: reff_id || 'testrevdep22',
    nominal: nominal || 5000,
    qr_string: 'xxxxxxxxxxxxxxxxxxxxx',
    qr_image: `https://atlantic-api-docs.vercel.app/qr/${id}`,
    status: 'pending',
    created_at: now.format('YYYY-MM-DD HH:mm:ss'),
    expired_at: expired.format('YYYY-MM-DD HH:mm:ss')
  };
  res.json(baseResponse(true, data, 200));
});

// Check Deposit Status
app.post('/deposit/status', (req, res) => {
  const { id } = req.body;
  const data = {
    id: id || 'txIsgoOtPklEOZ5w1N7A',
    reff_id: 'testrevdep22',
    nominal: '20000',
    tambahan: '0',
    fee: '300',
    get_balance: '19700',
    metode: 'E-Wallet DANA',
    status: 'success',
    created_at: '2024-02-13 14:25:22'
  };
  res.json(baseResponse(true, data, 200));
});

// Get Metode Deposit
app.post('/deposit/metode', (req, res) => {
  const metodeList = [
    { metode: "OVO", type: "ewallet", name: "OVO", min: "2000", max: "5000000", fee: "0", fee_persen: "1.65", status: "aktif", img_url: "https://s3.atlantic-pedia.co.id/1699928509_175ae776a7ce3eb6ea57.png" },
    { metode: "QRIS", type: "ewallet", name: "QRIS", min: "1", max: "5000000", fee: "200", fee_persen: "0.7", status: "aktif", img_url: "https://s3.atlantic-pedia.co.id/1699928452_bf58d7f0dd0491fed9b1.png" },
    { metode: "SHOPEEPAY", type: "ewallet", name: "SHOPEEPAY", min: "2000", max: "5000000", fee: "0", fee_persen: "2.1", status: "aktif", img_url: "https://s3.atlantic-pedia.co.id/1699928544_70a6a11387077f9b087d.png" },
    { metode: "DANA", type: "ewallet", name: "DANA", min: "2000", max: "5000000", fee: "0", fee_persen: "1.5", status: "aktif", img_url: "https://s3.atlantic-pedia.co.id/1699928468_984670a3b034e1c8312b.png" },
    { metode: "LINKAJA", type: "ewallet", name: "LINKAJA", min: "2000", max: "5000000", fee: "0", fee_persen: "1.65", status: "aktif", img_url: "https://s3.atlantic-pedia.co.id/1699928622_df1bc16fb0cb67c68d43.png" }
  ];
  res.json(baseResponse(true, metodeList, 200));
});

// ==================== TRANSAKSI ====================

// Create Transaksi
app.post('/transaksi/create', (req, res) => {
  const { reff_id, code, target } = req.body;
  const id = uuidv4();
  const now = moment();
  let layanan = "Data 1 GB / 30 Hari";
  let price = "58507";
  if (code === 'KODE2') {
    layanan = "Data 10 GB / 30 Hari";
    price = "100000";
  }
  const data = {
    id,
    reff_id: reff_id || 'reffexample123',
    layanan,
    code: code || 'KODE1',
    target: target || '0856123456789',
    price,
    sn: null,
    status: 'pending',
    created_at: now.format('YYYY-MM-DD HH:mm:ss')
  };
  res.json(baseResponse(true, 'Transaksi diproses', data, 202));
});

// Check Transaksi Status
app.post('/transaksi/status', (req, res) => {
  const { id } = req.body;
  const data = {
    id: id || 'IDTrxExample123456789',
    reff_id: 'reffexample123',
    layanan: "Data 10 GB / 30 Hari",
    code: "KODE1",
    target: "0856123456789",
    price: "58507",
    sn: "xxxxxxxxxxxx",
    status: "success",
    created_at: "2023-12-26 11:00:20"
  };
  res.json(baseResponse(true, data, 200));
});

// Export untuk Vercel
module.exports = app;
