const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');

router.get('/', staffController.getAllStaff); 
router.post('/', staffController.addStaff)
router.get('/:id', staffController.getStaffById)     // GET /api/staff
router.put('/:id', staffController.updateStaff);   // PUT /api/staff/1
router.delete('/:id', staffController.deleteStaff);// DELETE /api/staff/1

module.exports = router;