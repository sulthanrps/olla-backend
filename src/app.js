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
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Selamat datang di API Olla v1, Server berjalan dengan baik!', 
        timestamp: new Date().toISOString(),
    })
})
app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/staff', staffRoutes); 
app.use('/api/v1/customers', customersRoutes); 
app.use('/api/v1/products', productsRoutes); 
app.use('/api/v1/transactions', transactionRoutes); 
app.use('/api/v1/dashboard', dashboardRoutes); 

app.use((req, res, next) => {
    const error = new Error('Not Found: Rute tidak ditemukan');
    error.status = 404;
    next(error); 
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: err.message || 'Terjadi kesalahan pada server'
    });
});

module.exports = app; 