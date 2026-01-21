import { UserRole } from "@prisma/client";
import z from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    email: z.email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
    role: z.enum([
      UserRole.ORGANIZATION_ADMIN,
      UserRole.ORGANIZATION_MEMBER,
      UserRole.PLATFORM_ADMIN,
    ]),
    // Platform admin may pass organizationId; org admin's orgId will be enforced from token.
    organizationId: z.uuid().optional().nullable(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z
      .enum([UserRole.ORGANIZATION_ADMIN, UserRole.ORGANIZATION_MEMBER])
      .optional(),
    organizationId: z.uuid().optional().nullable(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};

