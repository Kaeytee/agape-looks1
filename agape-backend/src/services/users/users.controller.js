/**
 * Users Controller
 * Handles HTTP requests for user management
 * @module services/users/controller
 */

import { asyncHandler } from '../../middleware/error.middleware.js';
import * as usersService from './users.service.js';

/**
 * Get all users (Admin only)
 * GET /api/v1/admin/users
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page, limit } = req.query;
  
  const result = await usersService.getUsers({
    role,
    search,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  
  res.json({
    status: 'success',
    data: result,
  });
});

/**
 * Get user by ID (Admin only)
 * GET /api/v1/admin/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await usersService.getUserById(id);
  
  res.json({
    status: 'success',
    data: { user },
  });
});

/**
 * Update user role (Admin only)
 * PATCH /api/v1/admin/users/:id/role
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await usersService.updateUserRole(id, role);
  
  res.json({
    status: 'success',
    message: 'User role updated successfully',
    data: { user },
  });
});

/**
 * Get user statistics (Admin only)
 * GET /api/v1/admin/users/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await usersService.getUserStats();
  
  res.json({
    status: 'success',
    data: { stats },
  });
});
