const express = require('express');
const cors = require('cors');

// import routes
const customersRoutes = require('./routes/customers.routes');
const productsRoutes = require('./routes/products.routes');
const staffRoutes = require('./routes/staff.routes');
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transactions.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Selamat datang di API Olla v1, Server berjalan dengan baik!', 
        timestamp: new Date().toISOString(),
    })
})
app.use('/api/v1/auth', authRoutes); // Use authentication routes
app.use('/api/v1/staff', staffRoutes); // Use staff routes
app.use('/api/v1/customers', customersRoutes); // Use customers routes
app.use('/api/v1/products', productsRoutes); // Use products routes
app.use('/api/v1/transactions', transactionRoutes); // Use transactions routes
app.use('/api/v1/dashboard', dashboardRoutes); // Use dashboard routes

app.use((req, res, next) => {
    const error = new Error('Not Found: Rute tidak ditemukan');
    error.status = 404;
    next(error); // Meneruskan error ke middleware penanganan error selanjutnya.
});

app.use((err, req, res, next) => {
    // Mengatur status response dari error yang diberikan, atau default ke 500 (Internal Server Error)
    const statusCode = err.status || 500;
    
    // Mengirim respons error dalam format JSON yang konsisten
    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: err.message || 'Terjadi kesalahan pada server'
    });
});

module.exports = app; // Ekspor app untuk digunakan di server.js