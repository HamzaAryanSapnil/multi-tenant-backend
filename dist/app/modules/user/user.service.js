"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const prisma_1 = require("../../shared/prisma");
const user_constant_1 = require("./user.constant");
const create = async (authUser, payload) => {
    // Organization admin can only create inside own org
    const isOrgAdmin = authUser.role === client_1.UserRole.ORGANIZATION_ADMIN;
    const isPlatformAdmin = authUser.role === client_1.UserRole.PLATFORM_ADMIN;
    if (!isOrgAdmin && !isPlatformAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const organizationId = isOrgAdmin ? authUser.organizationId : payload.organizationId ?? null;
    if (!isPlatformAdmin && !organizationId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "organizationId is required");
    }
    if (payload.role === client_1.UserRole.PLATFORM_ADMIN && !isPlatformAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Only platform admin can create platform admins");
    }
    const existing = await prisma_1.prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "User already exists with this email");
    }
    const hashed = await bcryptjs_1.default.hash(payload.password, 10);
    return prisma_1.prisma.user.create({
        data: {
            email: payload.email,
            password: hashed,
            name: payload.name,
            role: payload.role,
            organizationId,
        },
    });
};
const getAllFromDB = async (authUser, params, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = params;
    const isPlatformAdmin = authUser.role === client_1.UserRole.PLATFORM_ADMIN;
    const isOrgAdmin = authUser.role === client_1.UserRole.ORGANIZATION_ADMIN;
    if (!isPlatformAdmin && !isOrgAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const andConditions = [];
    if (!isPlatformAdmin) {
        andConditions.push({
            organizationId: { equals: authUser.organizationId },
        });
    }
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
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
    const whereConditions = andConditions.length ? { AND: andConditions } : {};
    const data = await prisma_1.prisma.user.findMany({
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
    const total = await prisma_1.prisma.user.count({ where: whereConditions });
    return { meta: { page, limit, total }, data };
};
const getMe = async (authUser) => {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
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
const getByIdFromDB = async (authUser, id) => {
    const isPlatformAdmin = authUser.role === client_1.UserRole.PLATFORM_ADMIN;
    const isOrgAdmin = authUser.role === client_1.UserRole.ORGANIZATION_ADMIN;
    const isMember = authUser.role === client_1.UserRole.ORGANIZATION_MEMBER;
    if (isMember && authUser.userId !== id) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const user = await prisma_1.prisma.user.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (!isPlatformAdmin && isOrgAdmin && user.organizationId !== authUser.organizationId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    return user;
};
const updateIntoDB = async (authUser, id, payload) => {
    const isPlatformAdmin = authUser.role === client_1.UserRole.PLATFORM_ADMIN;
    const isOrgAdmin = authUser.role === client_1.UserRole.ORGANIZATION_ADMIN;
    const isMember = authUser.role === client_1.UserRole.ORGANIZATION_MEMBER;
    if (isMember && authUser.userId !== id) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!existing)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    // org admin can only update within org, and cannot promote to platform admin or change orgId
    if (!isPlatformAdmin && isOrgAdmin) {
        if (existing.organizationId !== authUser.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
        }
        if (payload.organizationId && payload.organizationId !== existing.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Org admin cannot change organizationId");
        }
        if (payload.role === client_1.UserRole.PLATFORM_ADMIN) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
        }
    }
    // member can only update own name
    if (isMember) {
        return prisma_1.prisma.user.update({
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
    return prisma_1.prisma.user.update({
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
const deleteFromDB = async (authUser, id) => {
    const isPlatformAdmin = authUser.role === client_1.UserRole.PLATFORM_ADMIN;
    const isOrgAdmin = authUser.role === client_1.UserRole.ORGANIZATION_ADMIN;
    if (!isPlatformAdmin && !isOrgAdmin) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
    if (!existing)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (!isPlatformAdmin && existing.organizationId !== authUser.organizationId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    // hard delete to keep schema minimal
    return prisma_1.prisma.user.delete({
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
exports.UserService = {
    create,
    getAllFromDB,
    getMe,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
};
