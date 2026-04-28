import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../../errors/apiError";
import { jwtHelpers } from "../../utils/jwtHelpers";

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get authorization token from header
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized! Please login."
        );
      }

      // Extract Bearer token
      const tokenParts = token.split(" ");
      let actualToken = token;

      if (tokenParts.length === 2 && tokenParts[0] === "Bearer") {
        actualToken = tokenParts[1] as any;
      }

      // Verify token
      let verifiedUser = null;
      try {
        verifiedUser = jwtHelpers.verifyToken(
          actualToken,
          config.jwt.secret as Secret
        );
      } catch (error) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Invalid or expired token. Please login again."
        );
      }

      // Attach user to request
      req.user = verifiedUser;

      // Role-based authorization check
      if (requiredRoles.length > 0 && verifiedUser.role) {
        if (!requiredRoles.includes(verifiedUser.role)) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "You do not have permission to access this resource."
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
