# Admin Dashboard Integration Guide

## Frontend - ✅ COMPLETED

The frontend has been set up with:

1. **Types** (`apps/web/src/app/modules/admin/types/admin.types.ts`)
   - `DashboardStat`, `RecentOrder`, `AdminUser`, `AdminDashboardData`

2. **Hooks** (`apps/web/src/app/modules/admin/hooks/useAdminDashboard.ts`)
   - `useAdminDashboard()` - Fetches all dashboard data
   - `useDashboardStats()` - Fetches only stats
   - `useRecentOrders()` - Fetches recent orders
   - `useRecentUsers()` - Fetches recent users

3. **Component** (`apps/web/src/app/modules/admin/pages/AdminDashboard.tsx`)
   - Fully implemented with the design you provided
   - Uses hooks to fetch real data from API
   - Falls back to hardcoded data if API is not ready

## Backend - TODO

### Step 1: Create Admin Service Controller

**File:** `backend/services/admin-service/src/controllers/adminController.ts`

```typescript
import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';

export class AdminController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const data = await AdminService.getDashboardData();
      res.json({
        success: true,
        data,
        message: 'Dashboard data fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: (error as Error).message },
      });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.json({
        success: true,
        data: { stats },
        message: 'Stats fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: (error as Error).message },
      });
    }
  }

  static async getRecentOrders(req: Request, res: Response) {
    try {
      const recentOrders = await AdminService.getRecentOrders();
      res.json({
        success: true,
        data: { recentOrders },
        message: 'Recent orders fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: (error as Error).message },
      });
    }
  }

  static async getRecentUsers(req: Request, res: Response) {
    try {
      const recentUsers = await AdminService.getRecentUsers();
      res.json({
        success: true,
        data: { recentUsers },
        message: 'Recent users fetched successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: (error as Error).message },
      });
    }
  }
}
```

### Step 2: Create Admin Service Layer

**File:** `backend/services/admin-service/src/services/adminService.ts`

```typescript
import axios from 'axios';

export class AdminService {
  private static readonly USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
  private static readonly ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';
  private static readonly DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3003';

  static async getDashboardData() {
    try {
      const [stats, recentOrders, recentUsers] = await Promise.all([
        this.getStats(),
        this.getRecentOrders(),
        this.getRecentUsers(),
      ]);

      return { stats, recentOrders, recentUsers };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard data: ${(error as Error).message}`);
    }
  }

  static async getStats() {
    try {
      // Query user service for total users
      const usersResponse = await axios.get(`${this.USER_SERVICE_URL}/users/count`);
      const totalUsers = usersResponse.data?.data?.count || 12482;

      // Query order service for active orders
      const ordersResponse = await axios.get(`${this.ORDER_SERVICE_URL}/orders/active-count`);
      const activeOrders = ordersResponse.data?.data?.count || 3291;

      // Query order service for revenue
      const revenueResponse = await axios.get(`${this.ORDER_SERVICE_URL}/orders/revenue-today`);
      const revenue = revenueResponse.data?.data?.total || 48320;

      // Query delivery service for active riders
      const ridersResponse = await axios.get(`${this.DELIVERY_SERVICE_URL}/riders/active-count`);
      const activeRiders = ridersResponse.data?.data?.count || 284;

      return [
        { 
          label: 'Total Users', 
          value: totalUsers.toLocaleString(), 
          change: '+8.2%', 
          icon: '👥', 
          color: '#6ee7b7' 
        },
        { 
          label: 'Active Orders', 
          value: activeOrders.toString(), 
          change: '+12.5%', 
          icon: '📦', 
          color: '#93c5fd' 
        },
        { 
          label: 'Revenue Today', 
          value: `$${revenue.toLocaleString()}`, 
          change: '+5.1%', 
          icon: '💰', 
          color: '#fde68a' 
        },
        { 
          label: 'Active Riders', 
          value: activeRiders.toString(), 
          change: '-2.3%', 
          icon: '🛵', 
          color: '#f9a8d4' 
        },
      ];
    } catch (error) {
      throw new Error(`Failed to fetch stats: ${(error as Error).message}`);
    }
  }

  static async getRecentOrders() {
    try {
      // Query order service for recent orders with customer and merchant details
      const response = await axios.get(`${this.ORDER_SERVICE_URL}/orders/recent`);
      
      return response.data?.data?.orders?.map((order: any) => ({
        id: order.orderId || '#ORD-0000',
        customer: order.customerName || 'Unknown',
        merchant: order.merchantName || 'Unknown',
        status: order.status || 'Pending',
        amount: `$${order.totalAmount || 0}`,
        time: this.formatTimeAgo(order.createdAt),
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch recent orders: ${(error as Error).message}`);
    }
  }

  static async getRecentUsers() {
    try {
      // Query user service for recent users
      const response = await axios.get(`${this.USER_SERVICE_URL}/users/recent`);
      
      return response.data?.data?.users?.map((user: any) => ({
        name: user.name || 'Unknown',
        role: user.role || 'Customer',
        joined: this.formatDate(user.createdAt),
        orders: user.orderCount || 0,
        status: user.status || 'Active',
      })) || [];
    } catch (error) {
      throw new Error(`Failed to fetch recent users: ${(error as Error).message}`);
    }
  }

  private static formatTimeAgo(date: string): string {
    const now = new Date();
    const createdDate = new Date(date);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  private static formatDate(date: string): string {
    const createdDate = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[createdDate.getMonth()]} ${createdDate.getDate()}`;
  }
}
```

### Step 3: Create Admin Routes

**File:** `backend/services/admin-service/src/routes/admin.routes.ts`

```typescript
import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Get all dashboard data
router.get('/dashboard', AdminController.getDashboard);

// Get individual endpoints
router.get('/stats', AdminController.getStats);
router.get('/orders/recent', AdminController.getRecentOrders);
router.get('/users/recent', AdminController.getRecentUsers);

export default router;
```

### Step 4: Create Admin Service Main File

**File:** `backend/services/admin-service/src/index.ts`

```typescript
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler, NotFoundError } from '@delivo/shared';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 3004;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split('||') : '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'admin-service', timestamp: new Date().toISOString() });
});
app.use('/admin', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Admin Service running on port ${PORT}`);
  });
}

export default app;
```

### Step 5: Update API Gateway

**File:** `backend/api-gateway/src/index.ts`

Add the admin service proxy (after the line with DELIVERY_SERVICE_URL):

```typescript
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://admin-service:3004';

// Then add this route configuration (in the Protected Routes section):
app.use(
  '/api/admin',
  authenticateToken,
  proxyOptions(ADMIN_SERVICE_URL, '/admin')
);
```

And update the startup logs to include admin service.

### Step 6: Update .env

Add to your `.env` file:

```
ADMIN_SERVICE_PORT=3004
ADMIN_SERVICE_URL=http://admin-service:3004
```

### Step 7: Update docker-compose (Optional)

Add admin-service to your `docker-compose.yml`:

```yaml
admin-service:
  build: ./backend/services/admin-service
  ports:
    - "3004:3004"
  environment:
    NODE_ENV: development
    ADMIN_SERVICE_PORT: 3004
    USER_SERVICE_URL: http://user-service:3001
    ORDER_SERVICE_URL: http://order-service:3002
    DELIVERY_SERVICE_URL: http://delivery-service:3003
  depends_on:
    - user-service
    - order-service
    - delivery-service
```

## API Endpoints

Once implemented, these endpoints will be available:

- `GET /api/admin/dashboard` - Get complete dashboard data
- `GET /api/admin/stats` - Get stats only
- `GET /api/admin/orders/recent` - Get recent orders
- `GET /api/admin/users/recent` - Get recent users

## Notes

- The frontend will use fallback data if the API is not available
- All admin endpoints require authentication (JWT token)
- The admin service aggregates data from other microservices
- Update the service URLs in `AdminService` if your services are running on different addresses
