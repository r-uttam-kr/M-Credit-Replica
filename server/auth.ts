import bcrypt from 'bcryptjs';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    fullName: string;
  };
}

// Session configuration
export function getSessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || 'mcredit-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Authentication middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = req.session.user;
  next();
}

// Role-based authorization middleware
export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Agent or Admin middleware
export const requireAgentOrAdmin = requireRole(['agent', 'admin']);

// Customer middleware (for customer-specific routes)
export const requireCustomer = requireRole(['customer']);