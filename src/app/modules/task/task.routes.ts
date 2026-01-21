import express from "express";
import { UserRole } from "@prisma/client";

import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { TaskController } from "./task.controller";
import { TaskValidation } from "./task.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(TaskValidation.createTaskSchema),
  TaskController.create,
);

router.get(
  "/",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  TaskController.getAllFromDB,
);

router.get(
  "/:id",
  auth(
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ORGANIZATION_MEMBER,
  ),
  TaskController.getByIdFromDB,
);

router.patch(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(TaskValidation.updateTaskSchema),
  TaskController.updateIntoDB,
);

router.delete(
  "/:id",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  TaskController.deleteFromDB,
);

// Task assignment routes
router.post(
  "/:id/assign",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  validateRequest(TaskValidation.assignTaskSchema),
  TaskController.assignTask,
);

router.delete(
  "/:id/assign/:userId",
  auth(UserRole.PLATFORM_ADMIN, UserRole.ORGANIZATION_ADMIN),
  TaskController.unassignTask,
);

export const taskRoutes = router;
