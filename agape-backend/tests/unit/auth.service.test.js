/**
 * Auth Service Unit Tests
 * @module tests/unit/auth.service
 */

import * as authService from '../../src/services/auth/auth.service.js';
import { query } from '../../src/config/database.js';
import { getRedisClient } from '../../src/config/redis.js';
import { hashPassword, comparePassword } from '../../src/utils/crypto.js';

jest.mock('../../src/config/database.js');
jest.mock('../../src/config/redis.js');
jest.mock('../../src/utils/crypto.js');

describe('Auth Service', () => {
  let mockRedisClient;
  
  beforeEach(() => {
    mockRedisClient = {
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    
    getRedisClient.mockReturnValue(mockRedisClient);
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        name: 'Test User',
      };
      
      query.mockResolvedValueOnce({ rows: [] }); // Check existing user
      hashPassword.mockResolvedValue('hashed_password');
      query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          email: userData.email,
          name: userData.name,
          role: 'customer',
        }],
      }); // Insert user
      
      const result = await authService.register(userData);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('verificationToken');
      expect(result.user.email).toBe(userData.email);
      expect(mockRedisClient.setex).toHaveBeenCalled();
    });
    
    it('should throw error if email already exists', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });
      
      await expect(authService.register({
        email: 'existing@example.com',
        password: 'Test@1234',
        name: 'Test',
      })).rejects.toThrow('Email already registered');
    });
  });
  
  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'Test@1234';
      
      query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          email,
          password_hash: 'hashed_password',
          role: 'customer',
          verified_at: new Date(),
          failed_login_attempts: 0,
        }],
      });
      
      comparePassword.mockResolvedValue(true);
      query.mockResolvedValueOnce({ rows: [] }); // Update failed attempts
      query.mockResolvedValueOnce({ rows: [{ id: 'session-id' }] }); // Create session
      
      const result = await authService.login(email, password, {});
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });
    
    it('should throw error for invalid password', async () => {
      query.mockResolvedValueOnce({
        rows: [{
          id: 'user-id',
          email: 'test@example.com',
          password_hash: 'hashed_password',
          failed_login_attempts: 0,
        }],
      });
      
      comparePassword.mockResolvedValue(false);
      
      await expect(authService.login('test@example.com', 'wrong', {}))
        .rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-token';
      mockRedisClient.get.mockResolvedValue('user-id');
      query.mockResolvedValueOnce({ rows: [] });
      
      await authService.verifyEmail(token);
      
      expect(mockRedisClient.get).toHaveBeenCalledWith(`email_verify:${token}`);
      expect(query).toHaveBeenCalled();
      expect(mockRedisClient.del).toHaveBeenCalledWith(`email_verify:${token}`);
    });
    
    it('should throw error for invalid token', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      
      await expect(authService.verifyEmail('invalid-token'))
        .rejects.toThrow('Invalid or expired verification token');
    });
  });
});
