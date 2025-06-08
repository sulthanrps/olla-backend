const { pool, query, sql } = require('../config/db');

exports.getAllTransactions = async (req, res) => {
    try {
        const result = await pool.query("SELECT t.id_transaction, t.hari, t.tanggal, c.nama as nama_customer, p.nama_product, p.harga, t.size, t.warna, t.jenis_transaksi, t.qty, (p.harga * t.qty) as total_harga, k.nama as nama_kasir FROM transactions t JOIN products p on t.id_product = p.id_product JOIN customers c on t.id_customer = c.id_customer JOIN kasir k on t.id_kasir = k.id_kasir;")
        res.status(200).json({
            status: 'success',
            count: result.recordset.length,
            data: result.recordset
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: `Server Error: ${error.message}`
        })
    }
}

exports.createTransaction = async (req, res) => {
    const { id_customer, id_product, size, warna, jenis_transaksi, qty, id_kasir } = req.body;

    if (!id_customer || !id_product || !size || !warna || !jenis_transaksi || !qty || !id_kasir) {
        return res.status(400).json({ status: 'fail', message: 'Semua field wajib diisi' });
    }

    const transaction = new sql.Transaction(pool);
    try {
        // Memulai transaksi database
        await transaction.begin();

        // --- Langkah 1: Cek stok produk ---
        const productRequest = new sql.Request(transaction);
        productRequest.input('id_product', sql.Int, id_product);
        const productResult = await productRequest.query('SELECT stok FROM products WHERE id_product = @id_product');
        
        const currentStock = productResult.recordset[0]?.stok;

        if (currentStock === undefined) {
            await transaction.rollback();
            return res.status(404).json({ status: 'fail', message: 'Produk tidak ditemukan.' });
        }
        if (currentStock < qty) {
            await transaction.rollback();
            return res.status(400).json({ status: 'fail', message: `Stok produk tidak mencukupi. Sisa stok: ${currentStock}` });
        }

        // --- Langkah 2: Masukkan data ke tabel transactions ---
        const today = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const namaHari = days[today.getDay()];

        const transactionRequest = new sql.Request(transaction);
        transactionRequest.input('hari', sql.VarChar, namaHari);
        transactionRequest.input('tanggal', sql.Date, today);
        transactionRequest.input('id_customer', sql.Int, id_customer);
        transactionRequest.input('id_product', sql.Int, id_product);
        transactionRequest.input('size', sql.VarChar, size);
        transactionRequest.input('warna', sql.VarChar, warna);
        transactionRequest.input('jenis_transaksi', sql.VarChar, jenis_transaksi);
        transactionRequest.input('qty', sql.Int, qty);
        transactionRequest.input('id_kasir', sql.Int, id_kasir);

        await transactionRequest.query(
            `INSERT INTO transactions (hari, tanggal, id_customer, id_product, size, warna, jenis_transaksi, qty, id_kasir)
             VALUES (@hari, @tanggal, @id_customer, @id_product, @size, @warna, @jenis_transaksi, @qty, @id_kasir)`
        );

        // --- Langkah 3: Kurangi stok di tabel products ---
        const updateStockRequest = new sql.Request(transaction);
        updateStockRequest.input('qty', sql.Int, qty);
        updateStockRequest.input('id_product', sql.Int, id_product);
        await updateStockRequest.query('UPDATE products SET stok = stok - @qty WHERE id_product = @id_product');

        // Jika semua berhasil, commit transaksi
        await transaction.commit();

        res.status(201).json({ status: 'success', message: 'Transaksi berhasil dibuat' });

    } catch (error) {
        // Jika ada error di salah satu langkah, batalkan semua perubahan (rollback)
        await transaction.rollback();
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
}