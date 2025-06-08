const express = require('express');
const router = express.Router();

const customersController = require('../controllers/customers.controller');

router.get('/', customersController.getAllCustomers); // Get all customers

router.post('/', customersController.createCustomer); // Create a new customer

router.get('/:id', customersController.getCustomersById); // Get customer by ID

router.put('/:id', customersController.updateCustomer); // Update customer by ID

router.delete('/:id', customersController.deleteCustomer); // Delete customer by ID


module.exports = router; // Export the router to be used in app.js