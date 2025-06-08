const { pool, sql } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllStaff = async (req, res) => {
    try {
        const result = await pool.query("SELECT id_kasir, nama, username FROM kasir");
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

exports.getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const request = pool.request();
        request.input('id', sql.Int, id);

        const result = await request.query("SELECT id_kasir, nama, username FROM kasir WHERE id_kasir = @id");

        if (result.recordset.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Staff not found'
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

exports.addStaff = async (req, res) => {
    const { username, password, nama } = req.body;

    if (!username || !password || !nama) {
        return res.status(400).json({ status: 'fail', message: 'Username, password, dan nama wajib diisi' });
    }

    try {
        // Hashing password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const request = pool.request();
        request.input('username', sql.VarChar, username);
        request.input('password', sql.VarChar, hashedPassword); // Simpan password yang sudah di-hash
        request.input('nama', sql.VarChar, nama);

        await request.query('INSERT INTO kasir (username, password, nama) OUTPUT INSERTED.id_kasir VALUES (@username, @password, @nama)');

        res.status(201).json({
            status: 'success',
            message: 'Staff berhasil dibuat',
        });
    } catch (error) {
        // Error code 2627 adalah untuk unique constraint violation (username sudah ada)
        if (error.number === 2627) {
            return res.status(409).json({ status: 'fail', message: 'Username sudah digunakan.' });
        }
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

/**
 * @function updateStaff
 * @description Memperbarui data customer yang ada berdasarkan ID.
 */
exports.updateStaff = async (req, res) => {
    const { id } = req.params;
    const { username, nama } = req.body;

    try {
        // let hashedPassword;
        // // Jika ada password baru yang dikirim, hash password tersebut
        // if (password) {
        //     const salt = await bcrypt.genSalt(10);
        //     hashedPassword = await bcrypt.hash(password, salt);
        // }

        const request = pool.request();
        request.input('id_kasir', sql.Int, id);
        request.input('username', sql.VarChar, username);
        request.input('nama', sql.VarChar, nama);
        // if (hashedPassword) {
        //     request.input('password', sql.VarChar, hashedPassword);
        // }

        // Query dinamis untuk update, hanya update field yang ada
        const querySet = [];
        if (username) querySet.push('username = @username');
        if (nama) querySet.push('nama = @nama');
        // if (hashedPassword) querySet.push('password = @password');
        
        if (querySet.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Tidak ada data untuk diupdate' });
        }

        const query = `UPDATE kasir SET ${querySet.join(', ')} WHERE id_kasir = @id_kasir`;
        await request.query(query);

        res.status(200).json({ status: 'success', message: 'Data staff berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
};

// DELETE: Menghapus data staff
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const request = pool.request();
        request.input('id_kasir', sql.Int, id);
        await request.query('DELETE FROM kasir WHERE id_kasir = @id_kasir');
        res.status(200).json({ status: 'success', message: 'Staff berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ` + error.message });
    }
};