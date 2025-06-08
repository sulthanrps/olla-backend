const { pool, sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGN UP / REGISTER: Membuat user baru
exports.register = async (req, res) => {
    const { username, password, nama } = req.body;

    if (!username || !password || !nama) {
        return res.status(400).json({ status: 'fail', message: 'Username, password, dan nama wajib diisi' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const request = pool.request();
        request.input('username', sql.VarChar, username);
        request.input('password', sql.VarChar, hashedPassword);
        request.input('nama', sql.VarChar, nama);

        await request.query('INSERT INTO kasir (username, password, nama) OUTPUT INSERTED.id_kasir VALUES (@username, @password, @nama)');

        res.status(201).json({
            status: 'success',
            message: 'Registrasi berhasil. Silakan login.',
        });
    } catch (error) {
        if (error.number === 2627) { // Unique constraint violation
            return res.status(409).json({ status: 'fail', message: 'Username sudah digunakan.' });
        }
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
}

// LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'fail', message: 'Username dan password wajib diisi' });
    }

    try {
        const request = pool.request();
        request.input('username', sql.VarChar, username);
        const result = await request.query('SELECT * FROM kasir WHERE username = @username');

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ status: 'fail', message: 'Kombinasi username dan password salah' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: 'fail', message: 'Kombinasi username dan password salah' });
        }

        const payload = {
            id: user.id_kasir,
            username: user.username,
            nama: user.nama
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        res.status(200).json({
            status: 'success',
            message: 'Login berhasil',
            token: token
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: `Server Error: ${error.message}` });
    }
}