import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { OrganizationService } from "./organization.service";
import { organizationFilterableFields } from "./organization.constant";

const create = catchAsync(async (req: Request, res: Response) => {
  console.log("req.body", req.body);
  const result = await OrganizationService.create(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Organization created successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query as any, organizationFilterableFields) as any;
  const options = pick(req.query as any, ["page", "limit", "sortBy", "sortOrder"]) as any;

  const result = await OrganizationService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organizations retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.getByIdFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization retrieved successfully!",
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.updateIntoDB(req.params.id as string, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization updated successfully!",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationService.deleteFromDB(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Organization deleted successfully!",
    data: result,
  });
});

export const OrganizationController = {
  create,
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
};

