import express from "express";
import { UserRole } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.create,
);

router.get(
  "/",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  UserController.getAllFromDB,
);

router.get(
  "/me",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  UserController.getMe,
);

router.get(
  "/:id",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  UserController.getByIdFromDB,
);

router.patch(
  "/:id",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateIntoDB,
);

router.delete(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  UserController.deleteFromDB,
);

export const userRoutes = router;

