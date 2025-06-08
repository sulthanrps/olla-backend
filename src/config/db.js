require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    },
    pool: {
      max: 10, 
      min: 0,
      idleTimeoutMillis: 30000 
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

async function connectToDb() {
    try {
        console.log('Connecting to SQL Server...');
        await poolConnect; 
        console.log('✅ Database connection successful!');
    } catch (err) {
        console.error('❌ Database connection failed!', err);
        process.exit(1);
    }
}

module.exports = {
    pool,
    sql,
    connectToDb
};