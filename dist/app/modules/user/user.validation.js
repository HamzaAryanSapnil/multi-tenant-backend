"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
const createUserValidationSchema = zod_1.default.object({
    email: zod_1.default.string().email("Valid email is required"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
    name: zod_1.default.string().optional(),
    role: zod_1.default.enum([
        client_1.UserRole.ORGANIZATION_ADMIN,
        client_1.UserRole.ORGANIZATION_MEMBER,
        client_1.UserRole.PLATFORM_ADMIN,
    ]),
    // Platform admin may pass organizationId; org admin's orgId will be enforced from token.
    organizationId: zod_1.default.string().uuid().optional().nullable(),
});
const updateUserValidationSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    role: zod_1.default
        .enum([client_1.UserRole.ORGANIZATION_ADMIN, client_1.UserRole.ORGANIZATION_MEMBER])
        .optional(),
    organizationId: zod_1.default.string().uuid().optional().nullable(),
});
exports.UserValidation = {
    createUserValidationSchema,
    updateUserValidationSchema,
};
