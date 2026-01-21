import { Prisma, Task, UserRole } from "@prisma/client";
import httpStatus from "http-status";

import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IJwtPayload } from "../../types/common";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { taskSearchableFields } from "./task.constant";

const create = async (
  user: IJwtPayload,
  payload: {
    title: string;
    description?: string;
    status?: string;
    projectId: string;
  },
): Promise<Task> => {
  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot create tasks!",
    );
  }

  const project = await prisma.project.findUniqueOrThrow({
    where: { id: payload.projectId },
  });

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only create tasks in your organization's projects!",
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status as any,
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

const getAllFromDB = async (
  user: IJwtPayload,
  filters: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.TaskWhereInput[] = [];

  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    andConditions.push({
      assignments: {
        some: {
          userId: user.userId,
        },
      },
    });
  }

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (!user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You must belong to an organization!",
      );
    }
    andConditions.push({
      project: {
        organizationId: user.organizationId,
      },
    });
  }


  if (searchTerm) {
    andConditions.push({
      OR: taskSearchableFields.map((field) => ({
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
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.TaskWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.task.findMany({
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

  const total = await prisma.task.count({
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

const getByIdFromDB = async (user: IJwtPayload, id: string): Promise<Task> => {
  const task = await prisma.task.findUniqueOrThrow({
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

  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    const isAssigned = task.assignments.some((a) => a.userId === user.userId);
    if (!isAssigned) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only view tasks assigned to you!",
      );
    }
  } else if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (task.project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only view tasks in your organization!",
      );
    }
  }

  return task;
};

const updateIntoDB = async (
  user: IJwtPayload,
  id: string,
  payload: { title?: string; description?: string; status?: string },
): Promise<Task> => {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id },
    include: {
      project: true,
      assignments: true,
    },
  });

  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot update tasks!",
    );
  }

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (task.project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only update tasks in your organization!",
      );
    }
  }

  return prisma.task.update({
    where: { id },
    data: payload as any,
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

const deleteFromDB = async (user: IJwtPayload, id: string): Promise<Task> => {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id },
    include: {
      project: true,
    },
  });

  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot delete tasks!",
    );
  }

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (task.project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only delete tasks in your organization!",
      );
    }
  }

  return prisma.task.delete({
    where: { id },
  });
};

const assignTask = async (
  user: IJwtPayload,
  taskId: string,
  userId: string,
) => {
  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot assign tasks!",
    );
  }

  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    include: {
      project: true,
    },
  });

 
  const targetUser = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (task.project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only assign tasks in your organization!",
      );
    }
    if (targetUser.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only assign tasks to users in your organization!",
      );
    }
  }

  const existing = await prisma.taskAssignment.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Task is already assigned to this user!",
    );
  }

  const assignment = await prisma.taskAssignment.create({
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

const unassignTask = async (
  user: IJwtPayload,
  taskId: string,
  userId: string,
) => {
  if (user.role === UserRole.ORGANIZATION_MEMBER) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Members cannot unassign tasks!",
    );
  }

  const task = await prisma.task.findUniqueOrThrow({
    where: { id: taskId },
    include: {
      project: true,
    },
  });

  if (user.role === UserRole.ORGANIZATION_ADMIN) {
    if (task.project.organizationId !== user.organizationId) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only unassign tasks in your organization!",
      );
    }
  }

  const assignment = await prisma.taskAssignment.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (!assignment) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Task assignment not found!",
    );
  }

  await prisma.taskAssignment.delete({
    where: {
      id: assignment.id,
    },
  });

  return { message: "Task unassigned successfully!" };
};

export const TaskService = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  assignTask,
  unassignTask,
};
