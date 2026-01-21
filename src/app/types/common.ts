export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
  organizationId: string | null;
  iat?: number;
  exp?: number;
}

