"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const globalErrorHandler = (err, req, res, next) => {
    console.log(err);
    let statusCode = err.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            message = "Duplicate key error",
                error = err.meta,
                statusCode = http_status_1.default.CONFLICT;
        }
        if (err.code === "P1000") {
            message = "Authentication failed against database server",
                error = err.meta,
                statusCode = http_status_1.default.BAD_GATEWAY;
        }
        if (err.code === "P2003") {
            message = "Foreign key constraint failed",
                error = err.meta,
                statusCode = http_status_1.default.BAD_REQUEST;
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        message = "Validation Error",
            error = err.message,
            statusCode = http_status_1.default.BAD_REQUEST;
    }
    else if (err instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        message = "Unknown Prisma error occured!",
            error = err.message,
            statusCode = http_status_1.default.BAD_REQUEST;
    }
    else if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        message = "Prisma client failed to initialize!",
            error = err.message,
            statusCode = http_status_1.default.BAD_REQUEST;
    }
    res.status(statusCode).json({
        success,
        message,
        error
    });
};
exports.default = globalErrorHandler;
