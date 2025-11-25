# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive troubleshooting section in README.md covering:
  - PostgreSQL authentication error resolution
  - Redis installation and configuration
  - Common development environment issues
  - Health check endpoint documentation
  
### Fixed
- **Database Connection Issue** (2025-10-14):
  - Reset PostgreSQL password for `postgres` user to resolve authentication errors
  - Created missing `agape_looks` database
  - Updated `.env` file with correct database credentials
  - Verified database connectivity and health checks
  
- **Redis Service** (2025-10-14):
  - Installed Redis server (version 7.0.15) on Ubuntu 24.04
  - Configured Redis to start automatically on system boot
  - Verified Redis connectivity

### Changed
- Updated README.md with detailed troubleshooting guide
- Documented database setup procedures
- Added Redis installation instructions for Ubuntu/Debian systems

## [1.0.0] - 2025-10-13

### Initial Release
- Full-featured e-commerce backend system
- Authentication service with JWT and 2FA support
- Product catalog management
- Shopping cart functionality
- Order processing and payment integration
- Paystack payment gateway integration
- Email notifications via Resend
- Media management via Cloudinary
- Comprehensive API documentation
- Database schema and migrations
- Security features (RBAC, rate limiting, input validation)
- Monitoring and observability setup
- Docker and Docker Compose support
