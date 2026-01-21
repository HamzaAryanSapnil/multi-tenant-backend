import express from "express";
import { UserRole } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ProjectController } from "./project.controller";
import { ProjectValidation } from "./project.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(ProjectValidation.createProjectSchema),
  ProjectController.create,
);

router.get(
  "/",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  ProjectController.getAllFromDB,
);

router.get(
  "/:id",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  ProjectController.getByIdFromDB,
);

router.patch(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(ProjectValidation.updateProjectSchema),
  ProjectController.updateIntoDB,
);

router.delete(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  ProjectController.deleteFromDB,
);

export const projectRoutes = router;
