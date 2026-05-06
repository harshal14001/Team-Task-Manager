const express = require('express');
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for /api/projects
router.route('/')
  .get(protect, getProjects) // Anyone logged in can get projects (logic inside controller handles filtering)
  .post(protect, admin, createProject); // ONLY Admins can POST (create) a project

router.route('/:id')
  .put(protect, admin, updateProject)    // ONLY Admins can UPDATE
  .delete(protect, admin, deleteProject); // ONLY Admins can DELETE

module.exports = router;