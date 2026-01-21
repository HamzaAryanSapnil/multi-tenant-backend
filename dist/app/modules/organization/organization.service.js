"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const organization_constant_1 = require("./organization.constant");
const create = async (payload) => {
    const created = await prisma_1.prisma.organization.create({
        data: payload,
    });
    return created;
};
const getAllFromDB = async (params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: organization_constant_1.organizationSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filters = Object.keys(filterData).map((key) => ({
            [key]: { equals: filterData[key] },
        }));
        andConditions.push(...filters);
    }
    const whereConditions = andConditions.length
        ? { AND: andConditions }
        : {};
    const data = await prisma_1.prisma.organization.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
    });
    const total = await prisma_1.prisma.organization.count({ where: whereConditions });
    return {
        meta: { page, limit, total },
        data,
    };
};
const getByIdFromDB = async (id) => {
    const org = await prisma_1.prisma.organization.findUnique({
        where: { id },
    });
    if (!org) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Organization not found");
    }
    return org;
};
const updateIntoDB = async (id, payload) => {
    await getByIdFromDB(id);
    return prisma_1.prisma.organization.update({
        where: { id },
        data: payload,
    });
};
const deleteFromDB = async (id) => {
    await getByIdFromDB(id);
    return prisma_1.prisma.organization.delete({
        where: { id },
    });
};
exports.OrganizationService = {
    create,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
};
