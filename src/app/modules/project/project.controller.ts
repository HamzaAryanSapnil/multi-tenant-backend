import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { IJwtPayload } from "../../types/common";
import { ProjectService } from "./project.service";
import { projectFilterableFields } from "./project.constant";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.create(
    req.user as IJwtPayload,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project created successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as Record<string, any>, projectFilterableFields);
  const options = pick(req.query as Record<string, any>, [
    "page",
    "limit",
    "sortBy",
    "sortOrder",
  ]);

  const result = await ProjectService.getAllFromDB(
    req.user as IJwtPayload,
    filters,
    options,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Projects retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.getByIdFromDB(
    req.user as IJwtPayload,
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project retrieved successfully!",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.updateIntoDB(
    req.user as IJwtPayload,
    req.params.id as string,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project updated successfully!",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectService.deleteFromDB(
    req.user as IJwtPayload,
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Project deleted successfully!",
    data: result,
  });
});

export const ProjectController = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};
