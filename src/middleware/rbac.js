import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { ApiError } from "./errorHandler.js";

/** @typedef {"viewer"|"editor"|"admin"} Role */

/**
 * Resolves the BetterAuth session from the request headers and attaches
 * `req.user` / `req.session`. Does not reject unauthenticated requests —
 * pair with `requireAuth` / `requireRole` for that.
 */
export async function attachSession(req, res, next) {
  try {
    const result = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    req.user = result?.user ?? null;
    req.session = result?.session ?? null;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  next();
}

/**
 * @param {...Role} roles - roles allowed to access the route
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Insufficient permissions"));
    }
    next();
  };
}
