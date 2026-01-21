import { Organization, Prisma } from "@prisma/client";
import httpStatus from "http-status";

import ApiError from "../../errors/ApiError";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { prisma } from "../../shared/prisma";
import { organizationSearchableFields } from "./organization.constant";

const create = async (payload: { name: string; description?: string }) => {
  const created = await prisma.organization.create({
    data: payload,
  });
  return created;
};

const getAllFromDB = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.OrganizationWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: organizationSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.OrganizationWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  const data = await prisma.organization.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.organization.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data,
  };
};

const getByIdFromDB = async (id: string): Promise<Organization> => {
  const org = await prisma.organization.findUnique({
    where: { id },
  });
  if (!org) {
    throw new ApiError(httpStatus.NOT_FOUND, "Organization not found");
  }
  return org;
};

const updateIntoDB = async (
  id: string,
  payload: Partial<{ name: string; description?: string }>,
): Promise<Organization> => {
  await getByIdFromDB(id);
  return prisma.organization.update({
    where: { id },
    data: payload,
  });
};

const deleteFromDB = async (id: string): Promise<Organization> => {
  await getByIdFromDB(id);
  return prisma.organization.delete({
    where: { id },
  });
};

export const OrganizationService = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};

