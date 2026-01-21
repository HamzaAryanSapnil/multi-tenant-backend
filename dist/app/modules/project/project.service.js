"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../shared/prisma");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const project_constant_1 = require("./project.constant");
const create = async (user, payload) => {
    let organizationId = payload.organizationId;
    // Org Admin/Member must use their own organizationId
    if (user.role !== client_1.UserRole.PLATFORM_ADMIN) {
        if (!user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "You must belong to an organization to create projects!");
        }
        organizationId = user.organizationId;
    }
    else {
        // Platform Admin must specify organizationId
        if (!organizationId) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Platform Admin must specify organizationId!");
        }
    }
    // Verify organization exists
    await prisma_1.prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
    });
    const project = await prisma_1.prisma.project.create({
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
const getAllFromDB = async (user, filters, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];
    // Org scoping: non-platform users see only their org's projects
    if (user.role !== client_1.UserRole.PLATFORM_ADMIN) {
        if (!user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must belong to an organization!");
        }
        andConditions.push({ organizationId: user.organizationId });
    }
    // Search
    if (searchTerm) {
        andConditions.push({
            OR: project_constant_1.projectSearchableFields.map((field) => ({
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
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma_1.prisma.project.findMany({
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
    const total = await prisma_1.prisma.project.count({
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
const getByIdFromDB = async (user, id) => {
    const project = await prisma_1.prisma.project.findUniqueOrThrow({
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
    if (user.role !== client_1.UserRole.PLATFORM_ADMIN) {
        if (project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only access projects in your organization!");
        }
    }
    return project;
};
const updateIntoDB = async (user, id, payload) => {
    const project = await prisma_1.prisma.project.findUniqueOrThrow({
        where: { id },
    });
    // Org scoping + role check
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot update projects!");
    }
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only update projects in your organization!");
        }
    }
    return prisma_1.prisma.project.update({
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
const deleteFromDB = async (user, id) => {
    const project = await prisma_1.prisma.project.findUniqueOrThrow({
        where: { id },
    });
    // Org scoping + role check
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot delete projects!");
    }
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only delete projects in your organization!");
        }
    }
    return prisma_1.prisma.project.delete({
        where: { id },
    });
};
exports.ProjectService = {
    create,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
};
