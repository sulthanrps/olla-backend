const express = require('express');
const router = express.Router();

const transactionsController = require('../controllers/transactions.controller');

router.get('/', transactionsController.getAllTransactions);
router.post('/', transactionsController.createTransaction);

module.exports = router;