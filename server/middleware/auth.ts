

import { Request, Response, NextFunction } from "express";
import { db } from "../db";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email?: string;
        name?: string;
        isAdmin?: boolean;
      };
    }
  }
}

/**
 * Middleware to check if user is authenticated
 * Loads user data from database and attaches to req.user
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔐 Auth Check:', {
      path: req.path,
      method: req.method,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      userId: req.session?.userId
    });

    // Check if session exists and has userId
    if (!req.session?.userId) {
      console.log('❌ No session userId found');
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'Please log in to continue.' 
      });
    }

    // Fetch complete user data from database
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, req.session.userId),
      columns: {
        id: true,
        username: true,
        email: true,
        name: true,
        isAdmin: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database for userId:', req.session.userId);
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        message: 'User account not found. Please log in again.' 
      });
    }

    console.log('✅ User authenticated:', {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication' 
    });
  }
};

/**
 * Middleware to check if user is an admin
 * Must be used AFTER requireAuth middleware
 * 
 * Usage: app.get('/api/admin/something', requireAuth, requireAdmin, handler)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('🛡️ Admin Check:', {
    path: req.path,
    user: req.user?.username,
    isAdmin: req.user?.isAdmin
  });

  if (!req.user) {
    console.log('❌ No user attached to request');
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required',
      message: 'You must be logged in to access this resource.' 
    });
  }

  if (!req.user.isAdmin) {
    console.log('❌ User is not admin:', req.user.username);
    return res.status(403).json({ 
      success: false,
      error: 'Admin access required',
      message: 'You do not have permission to access this resource.' 
    });
  }

  console.log('✅ Admin access granted to:', req.user.username);
  next();
};

/**
 * Optional auth middleware - attaches user if authenticated but doesn't require it
 * Useful for routes that work for both authenticated and unauthenticated users
 * 
 * Usage: app.get('/api/public-but-personalized', optionalAuth, handler)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session?.userId) {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, req.session.userId),
        columns: {
          id: true,
          username: true,
          email: true,
          name: true,
          isAdmin: true
        }
      });

      if (user) {
        req.user = user;
        console.log('👤 Optional auth: User attached:', user.username);
      } else {
        console.log('⚠️ Optional auth: Session exists but user not found');
      }
    }
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue even on error for optional auth
    next();
  }
};