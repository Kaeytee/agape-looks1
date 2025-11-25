/**
 * Admin Controller
 * @module services/admin/controller
 */

import * as adminService from './admin.service.js';
import * as inventoryService from '../inventory/inventory.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const stats = await adminService.getDashboardStats({ from, to });
  
  res.json({
    status: 'success',
    data: stats,
  });
});

export const getSalesTrends = asyncHandler(async (req, res) => {
  const { period, limit } = req.query;
  const trends = await adminService.getSalesTrends(period, limit);
  
  res.json({
    status: 'success',
    data: { trends },
  });
});

export const getTopProducts = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const products = await adminService.getTopProducts(limit);
  
  res.json({
    status: 'success',
    data: { products },
  });
});

export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const variants = await inventoryService.getLowStockVariants();
  
  res.json({
    status: 'success',
    data: { variants },
  });
});

export const getInventoryStats = asyncHandler(async (req, res) => {
  const stats = await inventoryService.getInventoryStats();
  
  res.json({
    status: 'success',
    data: stats,
  });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await adminService.getAuditLogs(req.query);
  
  res.json({
    status: 'success',
    data: { logs },
  });
});

export const exportSales = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await adminService.exportSalesData({ from, to });
  
  // Convert to CSV
  const csv = [
    ['Order Number', 'Date', 'Status', 'Total', 'Customer Email', 'Customer Name'],
    ...data.map(row => [
      row.order_number,
      row.created_at,
      row.status,
      row.total,
      row.email,
      row.name,
    ]),
  ].map(row => row.join(',')).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_export.csv');
  res.send(csv);
});

export const updateStock = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity, operation } = req.body;
  
  const result = await inventoryService.updateStock(
    variantId,
    quantity,
    operation,
    req.user.id
  );
  
  res.json({
    status: 'success',
    message: 'Stock updated successfully',
    data: result,
  });
});
