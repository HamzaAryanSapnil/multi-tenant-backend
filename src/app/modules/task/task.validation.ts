import { z } from "zod";
import { TaskStatus } from "@prisma/client";

const createTaskSchema = z.object({
  body: z.object({
    title: z.string({
      message: "Task title is required",
    }),
    description: z.string().optional(),
    status: z
      .enum([
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
        TaskStatus.CANCELLED,
      ])
      .optional(),
    projectId: z.string({
      message: "Project ID is required",
    }),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z
      .enum([
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
        TaskStatus.CANCELLED,
      ])
      .optional(),
  }),
});

const assignTaskSchema = z.object({
  body: z.object({
    userId: z.string({
      message: "User ID is required",
    }),
  }),
});

export const TaskValidation = {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
};
