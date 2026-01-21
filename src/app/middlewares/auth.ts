import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

import config from "../../config";
import ApiError from "../errors/ApiError";
import { jwtHelper } from "../helper/jwtHelper";
import { IJwtPayload } from "../types/common";

declare module "express-serve-static-core" {
  interface Request {
    user?: IJwtPayload;
  }
}

const auth =
  (...roles: UserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken as string | undefined;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const decoded = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      ) as IJwtPayload;

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role as UserRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;

