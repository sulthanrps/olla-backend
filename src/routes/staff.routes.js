const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

router.get('/', staffController.getAllStaff); 
router.post('/', staffController.addStaff)
router.get('/:id', staffController.getStaffById)    
router.put('/:id', staffController.updateStaff);   
router.delete('/:id', staffController.deleteStaff);

module.exports = router;