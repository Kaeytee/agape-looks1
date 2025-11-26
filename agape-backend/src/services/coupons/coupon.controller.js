/**
 * Coupon Controller
 * @module services/coupons/controller
 */

import * as couponService from './coupon.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Coupon created successfully',
    data: { coupon },
  });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const { isActive, type, limit, offset, search } = req.query;

  const filters = {
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    type,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    search,
  };

  const coupons = await couponService.getCoupons(filters);

  res.json({
    status: 'success',
    data: { coupons, count: coupons.length },
  });
});

export const getCouponStats = asyncHandler(async (req, res) => {
  const stats = await couponService.getCouponStats();

  res.json({
    status: 'success',
    data: { stats },
  });
});

export const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.getCouponById(id);

  res.json({
    status: 'success',
    data: { coupon },
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.updateCoupon(id, req.body);

  res.json({
    status: 'success',
    message: 'Coupon updated successfully',
    data: { coupon },
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await couponService.deleteCoupon(id);

  res.json({
    status: 'success',
    message: 'Coupon deleted successfully',
  });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { cartSubtotal } = req.body;
  const userId = req.user?.id;

  const result = await couponService.applyCoupon(code, userId, cartSubtotal, 0);

  res.json({
    status: 'success',
    message: 'Coupon is valid',
    data: result,
  });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartSubtotal, shippingFee } = req.body;
  const userId = req.user?.id;

  const result = await couponService.applyCoupon(code, userId, cartSubtotal, shippingFee || 0);

  res.json({
    status: 'success',
    message: 'Coupon applied successfully',
    data: result,
  });
});

export const getCouponUsageHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit, offset } = req.query;

  const history = await couponService.getCouponUsageHistory(
    id,
    limit ? parseInt(limit) : undefined,
    offset ? parseInt(offset) : undefined
  );

  res.json({
    status: 'success',
    data: { usage: history, count: history.length },
  });
});
