import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../auth/jwt';
import { UnauthorizedError, ForbiddenError } from '../errors';

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// ─── Token Extraction ─────────────────────────────────────────────────────────

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// ─── Middleware: Require valid JWT ─────────────────────────────────────────────

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req);

  if (!token) {
    return next(new UnauthorizedError('Access token required'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

// ─── Middleware: Role-based access control ─────────────────────────────────────

export function authorizeRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
    }

    next();
  };
}
