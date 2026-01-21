"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const organization_controller_1 = require("./organization.controller");
const organization_validation_1 = require("./organization.validation");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN), (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.createOrganizationValidationSchema), organization_controller_1.OrganizationController.create);
router.get("/", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN), organization_controller_1.OrganizationController.getAllFromDB);
router.get("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN), organization_controller_1.OrganizationController.getByIdFromDB);
router.patch("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN), (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.updateOrganizationValidationSchema), organization_controller_1.OrganizationController.updateIntoDB);
router.delete("/:id", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN), organization_controller_1.OrganizationController.deleteFromDB);
exports.organizationRoutes = router;
