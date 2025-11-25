/**
 * Products Controller
 * @module services/products/controller
 */

import * as productsService from './products.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';
import config from '../../config/index.js';

// Helper to transform image URLs to absolute URLs
const transformProductImages = (product) => {
  if (!product) return product;

  const baseUrl = `http://localhost:${config.app.port}`;

  // Transform thumbnail
  if (product.thumbnail && !product.thumbnail.startsWith('http')) {
    product.thumbnail = `${baseUrl}${product.thumbnail}`;
  }

  // Ensure images is always an array
  if (!product.images || !Array.isArray(product.images)) {
    product.images = [];
  }

  // Transform images array - convert URLs and map field names
  product.images = product.images.map(img => ({
    id: img.id,
    url: img.url && !img.url.startsWith('http') ? `${baseUrl}${img.url}` : img.url,
    alt: img.alt_text || img.alt || product.title,
    type: img.type || 'main',
    order: img.position || img.order || 0
  }));

  return product;
};

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productsService.createProduct(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully',
    data: { product },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productsService.getProduct(id);

  res.json({
    status: 'success',
    data: { product: transformProductImages(product) },
  });
});

export const listProducts = asyncHandler(async (req, res) => {
  const products = await productsService.listProducts(req.query);

  res.json({
    status: 'success',
    data: { products: products.map(transformProductImages) },
  });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const products = await productsService.searchProducts(q, req.query);

  res.json({
    status: 'success',
    data: { products: products.map(transformProductImages) },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productsService.updateProduct(id, req.body, req.user.id);

  res.json({
    status: 'success',
    message: 'Product updated successfully',
    data: { product },
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productsService.deleteProduct(id, req.user.id);

  res.json({
    status: 'success',
    message: 'Product deleted successfully',
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await productsService.getCategories();

  res.json({
    status: 'success',
    data: { categories },
  });
});
