import { z } from "zod";

const createProjectSchema = z.object({
  body: z.object({
    name: z.string({
      message: "Project name is required",
    }),
    description: z.string().optional(),
    organizationId: z.uuid().optional(), // Platform Admin can specify; Org Admin uses their own
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const ProjectValidation = {
  createProjectSchema,
  updateProjectSchema,
};
