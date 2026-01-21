"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectValidation = void 0;
const zod_1 = require("zod");
const createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            message: "Project name is required",
        }),
        description: zod_1.z.string().optional(),
        organizationId: zod_1.z.string().uuid().optional(), // Platform Admin can specify; Org Admin uses their own
    }),
});
const updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
    }),
});
exports.ProjectValidation = {
    createProjectSchema,
    updateProjectSchema,
};
