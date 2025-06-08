const { pool, sql } = require('../config/db');

exports.getAllCustomers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM customers");
        res.status(200).json({
            status: 'success',
            count: result.recordset.length,
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: `Server Error: ${error.message}`
        })
    }
}

exports.getCustomersById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query("SELECT * FROM customers WHERE id_customer = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: result.recordset[0]
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: `Server Error: ${error.message}`
        })
    }
}

exports.createCustomer = async (req, res) => {
    try {
        const { nama, jenis_kelamin, no_telp, alamat } = req.body;

        if (!nama || !jenis_kelamin || !no_telp || !alamat) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama, jenis_kelamin, no_telp, alamat) wajib diisi' });
        }

        const request = pool.request();
        request.input('nama', sql.VarChar, nama);
        request.input('jenis_kelamin', sql.Char, jenis_kelamin);
        request.input('no_telp', sql.VarChar, no_telp);
        request.input('alamat', sql.VarChar, alamat);

        const result = await request.query`INSERT INTO customers (nama, jenis_kelamin, no_telp, alamat) OUTPUT INSERTED.id_customer VALUES (@nama, @jenis_kelamin, @no_telp, @alamat);`;
        const newCustomerId = result.recordset[0].id;
        res.status(201).json({
            status: 'success',
            message: 'Customer created successfully',
            data: { id_customer: newCustomerId },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, jenis_kelamin, no_telp, alamat } = req.body;

        if (!nama || !jenis_kelamin || !no_telp || !alamat) {
            return res.status(400).json({ status: 'fail', message: 'Semua field wajib diisi' });
        }
        
        const request = pool.request();
        request.input('id', sql.Int, id);
        request.input('nama', sql.VarChar, nama);
        request.input('jenis_kelamin', sql.Char, jenis_kelamin);
        request.input('no_telp', sql.VarChar, no_telp);
        request.input('alamat', sql.VarChar, alamat);

        const result = await request.query('UPDATE customers SET nama = @nama, jenis_kelamin = @jenis_kelamin, no_telp = @no_telp, alamat = @alamat WHERE id_customer = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ status: 'fail', message: 'Customer not found' });
        }
        
        res.status(200).json({
            status: 'success',
            message: 'Customer updated successfully',
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query('DELETE FROM customers WHERE id_customer = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ status: 'fail', message: 'Customer not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        if(error.number === 547) {
            return res.status(400).json({ status: 'fail', message: 'Customer tidak bisa dihapus karena memiliki riwayat transaksi.' });
        }
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};