"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
router.post("/login", auth_controller_1.AuthController.login);
router.get("/me", (0, auth_1.default)(client_1.UserRole.PLATFORM_ADMIN, client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER), auth_controller_1.AuthController.getMe);
exports.authRoutes = router;
