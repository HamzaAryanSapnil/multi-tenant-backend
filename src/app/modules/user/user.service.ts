import { Prisma, User, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";

import ApiError from "../../errors/ApiError";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { IJwtPayload } from "../../types/common";
import { userSearchableFields } from "./user.constant";

const create = async (
  authUser: IJwtPayload,
  payload: {
    email: string;
    password: string;
    name?: string;
    role: UserRole;
    organizationId?: string | null;
  },
): Promise<User> => {
  // Organization admin can only create inside own org
  const isOrgAdmin = authUser.role === UserRole.ORGANIZATION_ADMIN;
  const isPlatformAdmin = authUser.role === UserRole.PLATFORM_ADMIN;

  if (!isOrgAdmin && !isPlatformAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const organizationId = isOrgAdmin ? authUser.organizationId : payload.organizationId ?? null;

  if (!isPlatformAdmin && !organizationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "organizationId is required");
  }

  if (payload.role === UserRole.PLATFORM_ADMIN && !isPlatformAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "Only platform admin can create platform admins");
  }

  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email");
  }

  const hashed = await bcrypt.hash(payload.password, 10);

  return prisma.user.create({
    data: {
      email: payload.email,
      password: hashed,
      name: payload.name,
      role: payload.role,
      organizationId,
    },
  });
};

const getAllFromDB = async (authUser: IJwtPayload, params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const isPlatformAdmin = authUser.role === UserRole.PLATFORM_ADMIN;
  const isOrgAdmin = authUser.role === UserRole.ORGANIZATION_ADMIN;

  if (!isPlatformAdmin && !isOrgAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const andConditions: Prisma.UserWhereInput[] = [];

  if (!isPlatformAdmin) {
    andConditions.push({
      organizationId: { equals: authUser.organizationId },
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filters = Object.keys(filterData).map((key) => ({
      [key]: { equals: (filterData as any)[key] },
    }));
    andConditions.push(...filters);
  }

  const whereConditions: Prisma.UserWhereInput = andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return { meta: { page, limit, total }, data };
};

const getMe = async (authUser: IJwtPayload) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: authUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

const getByIdFromDB = async (authUser: IJwtPayload, id: string) => {
  const isPlatformAdmin = authUser.role === UserRole.PLATFORM_ADMIN;
  const isOrgAdmin = authUser.role === UserRole.ORGANIZATION_ADMIN;
  const isMember = authUser.role === UserRole.ORGANIZATION_MEMBER;

  if (isMember && authUser.userId !== id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!isPlatformAdmin && isOrgAdmin && user.organizationId !== authUser.organizationId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  return user;
};

const updateIntoDB = async (
  authUser: IJwtPayload,
  id: string,
  payload: { name?: string; role?: UserRole; organizationId?: string | null },
) => {
  const isPlatformAdmin = authUser.role === UserRole.PLATFORM_ADMIN;
  const isOrgAdmin = authUser.role === UserRole.ORGANIZATION_ADMIN;
  const isMember = authUser.role === UserRole.ORGANIZATION_MEMBER;

  if (isMember && authUser.userId !== id) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  // org admin can only update within org, and cannot promote to platform admin or change orgId
  if (!isPlatformAdmin && isOrgAdmin) {
    if (existing.organizationId !== authUser.organizationId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
    }
    if (payload.organizationId && payload.organizationId !== existing.organizationId) {
      throw new ApiError(httpStatus.FORBIDDEN, "Org admin cannot change organizationId");
    }
    if (payload.role === UserRole.PLATFORM_ADMIN) {
      throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
    }
  }

  // member can only update own name
  if (isMember) {
    return prisma.user.update({
      where: { id },
      data: { name: payload.name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return prisma.user.update({
    where: { id },
    data: {
      name: payload.name,
      role: payload.role,
      organizationId: isPlatformAdmin ? payload.organizationId ?? existing.organizationId : existing.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteFromDB = async (authUser: IJwtPayload, id: string) => {
  const isPlatformAdmin = authUser.role === UserRole.PLATFORM_ADMIN;
  const isOrgAdmin = authUser.role === UserRole.ORGANIZATION_ADMIN;

  if (!isPlatformAdmin && !isOrgAdmin) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (!isPlatformAdmin && existing.organizationId !== authUser.organizationId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hard delete to keep schema minimal
  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const UserService = {
  create,
  getAllFromDB,
  getMe,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};

