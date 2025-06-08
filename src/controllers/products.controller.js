const { pool, sql } = require('../config/db');
const Decimal = require('decimal.js');

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products");
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

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query("SELECT * FROM products WHERE id_product = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
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

/**
 * @function createProduct
 * @description Membuat customer baru dan menyimpannya ke database.
 */
exports.createProduct = async (req, res) => {
    try {
        // Ambil data dari body request
        const { nama_product, harga, stok } = req.body;

        // Validasi input dasar
        if (!nama_product || !harga || !stok) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama_product, harga, stok) wajib diisi' });
        }

        let hargaValue;
        try {
            hargaValue = new Decimal(harga);
        } catch (error) {
            return res.status(400).json({ status: 'fail', message: 'Format harga tidak valid.' });
        }

        // Buat request dengan parameter untuk keamanan
        const request = pool.request();
        request.input('nama_product', sql.VarChar, nama_product);
        request.input('harga', sql.Decimal(10, 2), hargaValue.toFixed(2)); // Pastikan harga disimpan dengan 2 desimal
        request.input('stok', sql.Int, stok);

        // Eksekusi query INSERT dan kembalikan ID yang baru dibuat
        const result = await request.query`INSERT INTO products (nama_product, harga, stok) OUTPUT INSERTED.id_product VALUES (@nama_product, @harga, @stok);`;
        const newProductId = result.recordset[0].id;

        // Kirim respons 201 Created yang menandakan resource baru telah dibuat
        res.status(201).json({
            status: 'success',
            message: 'Product added successfully',
            data: { id_product: newProductId },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

/**
 * @function updateProduct
 * @description Memperbarui data customer yang ada berdasarkan ID.
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_product, harga, stok } = req.body;

        // Validasi input
        if (!nama_product || !harga || !stok) {
            return res.status(400).json({ status: 'fail', message: 'Semua field (nama_product, harga, stok) wajib diisi' });
        }

        let hargaValue;
        try {
            hargaValue = new Decimal(harga);
        } catch(e) {
            return res.status(400).json({ status: 'fail', message: 'Format harga tidak valid.' });
        }
        
        const request = pool.request();

        request.input('id', sql.Int, id);
        request.input('nama_product', sql.VarChar, nama_product);
        request.input('harga', sql.Decimal(10, 2), hargaValue.toFixed(2));
        request.input('stok', sql.Int, stok);

        // Eksekusi query UPDATE
        const result = await request.query(
            'UPDATE products SET nama_product = @nama_product, harga = @harga, stok = @stok WHERE id_product = @id'
        );

        // Cek apakah ada baris yang terpengaruh. Jika tidak, berarti ID tidak ditemukan.
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ status: 'fail', message: 'Product not found' });
        }
        
        // Kirim respons 200 OK sebagai konfirmasi update berhasil
        res.status(200).json({
            status: 'success',
            message: 'Product updated successfully',
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

/**
 * @function deleteProduct
 * @description Menghapus data customer berdasarkan ID.
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query('DELETE FROM products WHERE id_product = @id');

        // Cek jika tidak ada baris yang terpengaruh (ID tidak ditemukan)
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ status: 'fail', message: 'Product not found' });
        }
        
        // Kirim respons 204 No Content, standar untuk delete yang sukses.
        // Tidak ada body dalam respons ini.
        res.status(204).send();
    } catch (error) {
        // Error ini bisa terjadi jika customer memiliki data di tabel 'transactions' (foreign key constraint)
        if(error.number === 547) {
            return res.status(400).json({ status: 'fail', message: 'Product tidak bisa dihapus karena memiliki riwayat transaksi.' });
        }
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};