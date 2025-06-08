require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: false, // Gunakan boolean dari .env
        trustServerCertificate: true // Baik untuk local dev, pertimbangkan diubah di production
    },
    pool: {
      max: 10, // Jumlah maksimum koneksi dalam pool
      min: 0,
      idleTimeoutMillis: 30000 // Waktu idle sebelum koneksi ditutup
    }
};

// Buat connection pool
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

// Fungsi untuk memastikan pool terhubung sebelum server mulai
// Fungsi ini akan dipanggil SATU KALI di file server.js
async function connectToDb() {
    try {
        console.log('Connecting to SQL Server...');
        await poolConnect; // Menunggu koneksi pool selesai
        console.log('✅ Database connection successful!');
    } catch (err) {
        console.error('❌ Database connection failed!', err);
        // Hentikan aplikasi jika koneksi database gagal saat startup
        process.exit(1);
    }
}

// Ekspor pool yang sudah siap pakai dan object sql untuk tipe data
module.exports = {
    pool,
    sql,
    connectToDb
};