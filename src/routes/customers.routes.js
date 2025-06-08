const express = require('express');
const router = express.Router();

const customersController = require('../controllers/customers.controller');

router.get('/', customersController.getAllCustomers);

router.post('/', customersController.createCustomer); 

router.get('/:id', customersController.getCustomersById); 

router.put('/:id', customersController.updateCustomer); 

router.delete('/:id', customersController.deleteCustomer);


module.exports = router;