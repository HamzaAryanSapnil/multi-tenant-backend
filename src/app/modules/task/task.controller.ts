import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { IJwtPayload } from "../../types/common";
import { TaskService } from "./task.service";
import { taskFilterableFields } from "./task.constant";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.create(req.user as IJwtPayload, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task created successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as Record<string, any>, taskFilterableFields);
  const options = pick(req.query as Record<string, any>, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);

  const result = await TaskService.getAllFromDB(
    req.user as IJwtPayload,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tasks retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.getByIdFromDB(
    req.user as IJwtPayload,
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task retrieved successfully!",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.updateIntoDB(
    req.user as IJwtPayload,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task updated successfully!",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.deleteFromDB(
    req.user as IJwtPayload,
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task deleted successfully!",
    data: result,
  });
});

const assignTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.assignTask(
    req.user as IJwtPayload,
    req.params.id as string,
    req.body.userId,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Task assigned successfully!",
    data: result,
  });
});

const unassignTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskService.unassignTask(
    req.user as IJwtPayload,
    req.params.id as string,
    req.params.userId as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Task unassigned successfully!",
    data: result,
  });
});

export const TaskController = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  assignTask,
  unassignTask,
};
