const express = require('express');
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  getUserTasks
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Project-specific Task Routes
router.route('/project/:projectId')
  .get(protect, getTasksByProject)      // Anyone in the project can view tasks
  .post(protect, admin, createTask);    // Only Admins can add tasks to a project

// Individual Task Routes
router.route('/:id')
  .put(protect, updateTask)             // Custom logic inside handles Admin vs Member permissions
  .delete(protect, admin, deleteTask);  // Only Admins can delete tasks

// dasgboard metrics
router.route('/').get(protect, getUserTasks);
module.exports = router;