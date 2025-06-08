const app = require('./app');
const { connectToDb } = require('./config/db'); // Impor fungsi connect

const PORT = process.env.PORT || 3000;

async function startServer() {
    // 1. Hubungkan ke database terlebih dahulu
    await connectToDb();
    
    // 2. Jika berhasil, baru jalankan server Express
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

startServer();