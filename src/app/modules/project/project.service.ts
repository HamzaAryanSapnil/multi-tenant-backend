import { Prisma, Project, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IJwtPayload } from "../../types/common";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { projectSearchableFields } from "./project.constant";

const create = async (
  user: IJwtPayload,
  payload: { name: string; description?: string; organizationId?: string },
): Promise<Project> => {
  let organizationId = payload.organizationId;
  console.log("organizationId", organizationId);

  // Org Admin/Member must use their own organizationId
  if (user.role !== UserRole.PLATFORM_ADMIN) {
    if (!user.organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You must belong to an organization to create projects!",
      );
    }
    organizationId = user.organizationId;
  } else {
    // Platform Admin must specify organizationId
    if (!organizationId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Platform Admin must specify organizationId!",
      );
    }
  }

  // Verify organization exists
  await prisma.organization.findUniqueOrThrow({
    where: { id: organizationId },
  });

  const project = await prisma.project.create({
    data: {
      name: payload.name,
      description: payload.description,
      organizationId,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return project;
};

const getAllFromDB = async (
  user: IJwtPayload,
  filters: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.ProjectWhereInput[] = [];

  // Org scoping: non-platform users see only their org's projects
  if (user.role !== UserRole.PLATFORM_ADMIN) {
    if (!user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You must belong to an organization!",
      );
    }
    andConditions.push({ organizationId: user.organizationId });
  }

  // Search
  if (searchTerm) {
    andConditions.push({
      OR: projectSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filters
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ProjectWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.project.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  const total = await prisma.project.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (
  user: IJwtPayload,
  id: string,
): Promise<Project> => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  });

  // Org scoping check
  if (user.role !== UserRole.PLATFORM_ADMIN) {
    if (project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only access projects in your organization!",
      );
    }
  }

  return project;
};

const updateIntoDB = async (
  user: IJwtPayload,
  id: string,
  payload: { name?: string; description?: string },
): Promise<Project> => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
  });

  // Org scoping + role check
  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot update projects!",
    );
  }

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only update projects in your organization!",
      );
    }
  }

  return prisma.project.update({
    where: { id },
    data: payload,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const deleteFromDB = async (
  user: IJwtPayload,
  id: string,
): Promise<Project> => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
  });

  // Org scoping + role check
  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot delete projects!",
    );
  }

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only delete projects in your organization!",
      );
    }
  }

  return prisma.project.delete({
    where: { id },
  });
};

export const ProjectService = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
