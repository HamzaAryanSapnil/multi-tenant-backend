import express from "express";
import { UserRole } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { OrganizationController } from "./organization.controller";
import { OrganizationValidation } from "./organization.validation";

const router = express.Router();



router.get("/", auth(UserRole.PLATFORM_ADMIN), OrganizationController.getAllFromDB);

router.get(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN),
  OrganizationController.getByIdFromDB,
);

router.post(
  "/",
  auth(UserRole.PLATFORM_ADMIN),
  validateRequest(OrganizationValidation.createOrganizationValidationSchema),
  OrganizationController.create,
);

router.patch(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN),
  validateRequest(OrganizationValidation.updateOrganizationValidationSchema),
  OrganizationController.updateIntoDB,
);

router.delete(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN),
  OrganizationController.deleteFromDB,
);

export const organizationRoutes = router;

