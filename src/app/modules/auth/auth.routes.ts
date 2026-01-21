import express from "express";
import { UserRole } from "@prisma/client";

import auth from "../../middlewares/auth";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.login);

router.get(
  "/me",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  AuthController.getMe,
);

export const authRoutes = router;
