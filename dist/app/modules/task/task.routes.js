"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const task_controller_1 = require("./task.controller");
const task_validation_1 = require("./task.validation");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), (0, validateRequest_1.default)(task_validation_1.TaskValidation.createTaskSchema), task_controller_1.TaskController.create);
router.get("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER), task_controller_1.TaskController.getAllFromDB);
router.get("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER), task_controller_1.TaskController.getByIdFromDB);
router.patch("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), (0, validateRequest_1.default)(task_validation_1.TaskValidation.updateTaskSchema), task_controller_1.TaskController.updateIntoDB);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), task_controller_1.TaskController.deleteFromDB);
// Task assignment routes
router.post("/:id/assign", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), (0, validateRequest_1.default)(task_validation_1.TaskValidation.assignTaskSchema), task_controller_1.TaskController.assignTask);
router.delete("/:id/assign/:userId", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), task_controller_1.TaskController.unassignTask);
exports.taskRoutes = router;
