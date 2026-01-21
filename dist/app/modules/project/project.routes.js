"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const project_controller_1 = require("./project.controller");
const project_validation_1 = require("./project.validation");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), (0, validateRequest_1.default)(project_validation_1.ProjectValidation.createProjectSchema), project_controller_1.ProjectController.create);
router.get("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER), project_controller_1.ProjectController.getAllFromDB);
router.get("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER), project_controller_1.ProjectController.getByIdFromDB);
router.patch("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), (0, validateRequest_1.default)(project_validation_1.ProjectValidation.updateProjectSchema), project_controller_1.ProjectController.updateIntoDB);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN), project_controller_1.ProjectController.deleteFromDB);
exports.projectRoutes = router;
