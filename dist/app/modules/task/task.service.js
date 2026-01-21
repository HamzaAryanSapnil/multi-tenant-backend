"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = require("../../shared/prisma");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationHelper_1 = require("../../helper/paginationHelper");
const task_constant_1 = require("./task.constant");
const create = async (user, payload) => {
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot create tasks!");
    }
    const project = await prisma_1.prisma.project.findUniqueOrThrow({
        where: { id: payload.projectId },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only create tasks in your organization's projects!");
        }
    }
    const task = await prisma_1.prisma.task.create({
        data: {
            title: payload.title,
            description: payload.description,
            status: payload.status,
            projectId: payload.projectId,
        },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
        },
    });
    return task;
};
const getAllFromDB = async (user, filters, options) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        andConditions.push({
            assignments: {
                some: {
                    userId: user.userId,
                },
            },
        });
    }
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (!user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You must belong to an organization!");
        }
        andConditions.push({
            project: {
                organizationId: user.organizationId,
            },
        });
    }
    if (searchTerm) {
        andConditions.push({
            OR: task_constant_1.taskSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
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
    const result = await prisma_1.prisma.task.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    const total = await prisma_1.prisma.task.count({
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
    const task = await prisma_1.prisma.task.findUniqueOrThrow({
        where: { id },
        include: {
            project: {
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        const isAssigned = task.assignments.some((a) => a.userId === user.userId);
        if (!isAssigned) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only view tasks assigned to you!");
        }
    }
    else if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (task.project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only view tasks in your organization!");
        }
    }
    return task;
};
const updateIntoDB = async (user, id, payload) => {
    const task = await prisma_1.prisma.task.findUniqueOrThrow({
        where: { id },
        include: {
            project: true,
            assignments: true,
        },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot update tasks!");
    }
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (task.project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only update tasks in your organization!");
        }
    }
    return prisma_1.prisma.task.update({
        where: { id },
        data: payload,
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                    organizationId: true,
                },
            },
            assignments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
};
const deleteFromDB = async (user, id) => {
    const task = await prisma_1.prisma.task.findUniqueOrThrow({
        where: { id },
        include: {
            project: true,
        },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot delete tasks!");
    }
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (task.project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only delete tasks in your organization!");
        }
    }
    return prisma_1.prisma.task.delete({
        where: { id },
    });
};
const assignTask = async (user, taskId, userId) => {
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot assign tasks!");
    }
    const task = await prisma_1.prisma.task.findUniqueOrThrow({
        where: { id: taskId },
        include: {
            project: true,
        },
    });
    const targetUser = await prisma_1.prisma.user.findUniqueOrThrow({
        where: { id: userId },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (task.project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only assign tasks in your organization!");
        }
        if (targetUser.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only assign tasks to users in your organization!");
        }
    }
    const existing = await prisma_1.prisma.taskAssignment.findFirst({
        where: {
            taskId,
            userId,
        },
    });
    if (existing) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Task is already assigned to this user!");
    }
    const assignment = await prisma_1.prisma.taskAssignment.create({
        data: {
            taskId,
            userId,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            },
            task: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                },
            },
        },
    });
    return assignment;
};
const unassignTask = async (user, taskId, userId) => {
    if (user.role === client_1.UserRole.ORGANIZATION_MEMBER) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Members cannot unassign tasks!");
    }
    const task = await prisma_1.prisma.task.findUniqueOrThrow({
        where: { id: taskId },
        include: {
            project: true,
        },
    });
    if (user.role === client_1.UserRole.ORGANIZATION_ADMIN) {
        if (task.project.organizationId !== user.organizationId) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "You can only unassign tasks in your organization!");
        }
    }
    const assignment = await prisma_1.prisma.taskAssignment.findFirst({
        where: {
            taskId,
            userId,
        },
    });
    if (!assignment) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Task assignment not found!");
    }
    await prisma_1.prisma.taskAssignment.delete({
        where: {
            id: assignment.id,
        },
    });
    return { message: "Task unassigned successfully!" };
};
exports.TaskService = {
    create,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    assignTask,
    unassignTask,
};
