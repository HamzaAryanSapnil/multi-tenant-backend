"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../shared/sendResponse"));
const pick_1 = __importDefault(require("../../helper/pick"));
const task_service_1 = require("./task.service");
const task_constant_1 = require("./task.constant");
const create = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.create(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Task created successfully!",
        data: result,
    });
});
const getAllFromDB = (0, catchAsync_1.default)(async (req, res) => {
    const filters = (0, pick_1.default)(req.query, task_constant_1.taskFilterableFields);
    const options = (0, pick_1.default)(req.query, [
        "page",
        "limit",
        "sortBy",
        "sortOrder",
    ]);
    const result = await task_service_1.TaskService.getAllFromDB(req.user, filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Tasks retrieved successfully!",
        meta: result.meta,
        data: result.data,
    });
});
const getByIdFromDB = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.getByIdFromDB(req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Task retrieved successfully!",
        data: result,
    });
});
const updateIntoDB = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.updateIntoDB(req.user, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Task updated successfully!",
        data: result,
    });
});
const deleteFromDB = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.deleteFromDB(req.user, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Task deleted successfully!",
        data: result,
    });
});
const assignTask = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.assignTask(req.user, req.params.id, req.body.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Task assigned successfully!",
        data: result,
    });
});
const unassignTask = (0, catchAsync_1.default)(async (req, res) => {
    const result = await task_service_1.TaskService.unassignTask(req.user, req.params.id, req.params.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Task unassigned successfully!",
        data: result,
    });
});
exports.TaskController = {
    create,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    assignTask,
    unassignTask,
};
