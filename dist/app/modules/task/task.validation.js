"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            message: "Task title is required",
        }),
        description: zod_1.z.string().optional(),
        status: zod_1.z
            .enum([
            client_1.TaskStatus.TODO,
            client_1.TaskStatus.IN_PROGRESS,
            client_1.TaskStatus.DONE,
            client_1.TaskStatus.CANCELLED,
        ])
            .optional(),
        projectId: zod_1.z.string({
            message: "Project ID is required",
        }),
    }),
});
const updateTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        status: zod_1.z
            .enum([
            client_1.TaskStatus.TODO,
            client_1.TaskStatus.IN_PROGRESS,
            client_1.TaskStatus.DONE,
            client_1.TaskStatus.CANCELLED,
        ])
            .optional(),
    }),
});
const assignTaskSchema = zod_1.z.object({
    body: zod_1.z.object({
        userId: zod_1.z.string({
            message: "User ID is required",
        }),
    }),
});
exports.TaskValidation = {
    createTaskSchema,
    updateTaskSchema,
    assignTaskSchema,
};
