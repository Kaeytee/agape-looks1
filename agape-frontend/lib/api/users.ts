import apiClient from './client';
import { User } from '../types';

export type { User };

import { authService } from '../services/auth.service';

/**
 * Get current user's profile
 * @returns {Promise<User>} User profile data
 */
export const getCurrentUser = async (): Promise<User> => {
  return authService.getCurrentUser();
};

export interface UpdateUserProfileData {
  name?: string;
  phone?: string;
}

/**
 * Update user profile
 * @param {UpdateUserProfileData} userData - User data to update
 * @returns {Promise<User>} Updated user data
 */
export const updateUserProfile = async (userData: UpdateUserProfileData): Promise<User> => {
  try {
    const response = await apiClient.patch('/auth/profile', userData);
    return response.data.data.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user orders
 * @returns {Promise<Array>} List of user orders
 */
export const getUserOrders = async (): Promise<Array<any>> => {
  try {
    const response = await apiClient.get('/orders/me');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get user wishlist
 * @returns {Promise<Array>} List of wishlist items
 */
export const getUserWishlist = async (): Promise<Array<any>> => {
  try {
    const response = await apiClient.get('/wishlist');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};
