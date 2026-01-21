"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationValidation = void 0;
const zod_1 = __importDefault(require("zod"));
const createOrganizationValidationSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required"),
    description: zod_1.default.string().optional(),
});
const updateOrganizationValidationSchema = zod_1.default.object({
    name: zod_1.default.string().min(1).optional(),
    description: zod_1.default.string().optional(),
});
exports.OrganizationValidation = {
    createOrganizationValidationSchema,
    updateOrganizationValidationSchema,
};
