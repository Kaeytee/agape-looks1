#!/usr/bin/env node
/**
 * Payment Flow Diagnostic Script
 * Tests the payment initialization flow and identifies issues
 */

import axios from 'axios';
import { createRedisClient } from '../src/config/redis.js';
import config from '../src/config/index.js';
import logger from '../src/utils/logger.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api/v1';

async function runDiagnostics() {
	console.log('🔍 Payment Flow Diagnostics Starting...\n');

	// 1. Check Redis Connection
	console.log('1️⃣  Checking Redis connection...');
	try {
		const redis = createRedisClient();
		await redis.ping();
		console.log('✅ Redis connected successfully');
		console.log(`   Host: ${config.redis.host}:${config.redis.port}`);
		console.log(`   TLS: ${config.redis.tls ? 'enabled' : 'disabled'}\n`);
	} catch (error) {
		console.error('❌ Redis connection failed:', error.message);
		console.log('   This will cause payment initialization to timeout\n');
	}

	// 2. Check Paystack Configuration
	console.log('2️⃣  Checking Paystack configuration...');
	const paystackConfigured = !!(config.paystack.secretKey && config.paystack.secretKey !== '');
	if (paystackConfigured) {
		console.log('✅ Paystack secret key configured');
		console.log(`   Base URL: ${config.paystack.baseUrl}`);
		console.log(`   Callback URL: ${config.paystack.callbackUrl}`);

		// Check if callback URL looks valid
		if (config.paystack.callbackUrl.includes('ngrok')) {
			console.log('⚠️  Warning: Using ngrok URL - ensure it is still active');
		}
		console.log();
	} else {
		console.error('❌ Paystack secret key not configured');
		console.log('   Set PAYSTACK_SECRET_KEY in .env file\n');
	}

	// 3. Test Paystack API connectivity
	console.log('3️⃣  Testing Paystack API connectivity...');
	try {
		const response = await axios.get('https://api.paystack.co/transaction', {
			headers: {
				'Authorization': `Bearer ${config.paystack.secretKey}`,
			},
			timeout: 10000,
		});
		console.log('✅ Paystack API accessible');
		console.log(`   Status: ${response.status}\n`);
	} catch (error) {
		if (error.response?.status === 401) {
			console.error('❌ Paystack API key invalid');
		} else {
			console.error('❌ Paystack API connection failed:', error.message);
		}
		console.log();
	}

	// 4. Check database connection
	console.log('4️⃣  Checking database configuration...');
	console.log(`   Host: ${config.database.host}:${config.database.port}`);
	console.log(`   Database: ${config.database.name}`);
	console.log(`   User: ${config.database.user}`);
	console.log();

	// 5. Check JWT configuration
	console.log('5️⃣  Checking authentication configuration...');
	console.log(`   JWT Issuer: ${config.jwt.issuer}`);
	console.log(`   Access Token Expiry: ${config.jwt.accessTokenExpiry}`);
	console.log(`   Refresh Token Expiry: ${config.jwt.refreshTokenExpiry}`);
	console.log();

	// Summary
	console.log('📋 Diagnostic Summary:');
	console.log('   Run this script to diagnose payment flow issues');
	console.log('   Check the output above for any ❌ errors or ⚠️  warnings');
	console.log('\n✅ Diagnostics complete!');
}

runDiagnostics().catch(error => {
	console.error('❌ Diagnostics failed:', error);
	process.exit(1);
});
