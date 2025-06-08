const express = require('express');
const router = express.Router();

const productController = require('../controllers/products.controller');

router.get('/', productController.getAllProducts); // Get all customers

router.post('/', productController.createProduct); // Create a new customer

router.get('/:id', productController.getProductById); // Get customer by ID

router.put('/:id', productController.updateProduct); // Update customer by ID

router.delete('/:id', productController.deleteProduct); // Delete customer by ID


module.exports = router; // Export the router to be used in app.js