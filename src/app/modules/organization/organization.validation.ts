import z from "zod";

const createOrganizationValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const updateOrganizationValidationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const OrganizationValidation = {
  createOrganizationValidationSchema,
  updateOrganizationValidationSchema,
};

