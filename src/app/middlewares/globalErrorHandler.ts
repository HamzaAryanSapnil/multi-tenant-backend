import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let success = false;
    let message = err.message || "Something went wrong!";
    let error = err;

    // Zod Validation Errors
    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        const errors = err.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
        }));
        message = "Validation failed";
        error = { errors };
    }

    // Prisma Known Request Errors
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            const field = (err.meta?.target as string[])?.join(", ") || "field";
            message = `Duplicate value for ${field}. This ${field} already exists.`;
            error = { field, code: err.code };
            statusCode = httpStatus.CONFLICT;
        } else if (err.code === "P2025") {
            message = "Record not found. The requested resource does not exist.";
            error = { code: err.code };
            statusCode = httpStatus.NOT_FOUND;
        } else if (err.code === "P2003") {
            const field = (err.meta?.field_name as string) || "field";
            message = `Invalid ${field}. Related record does not exist.`;
            error = { field, code: err.code };
            statusCode = httpStatus.BAD_REQUEST;
        } else if (err.code === "P1000") {
            message = "Database authentication failed. Please check database credentials.";
            error = { code: err.code };
            statusCode = httpStatus.BAD_GATEWAY;
        } else {
            message = "Database operation failed.";
            error = { code: err.code, meta: err.meta };
            statusCode = httpStatus.BAD_REQUEST;
        }
    }

    // Prisma Validation Errors
    else if (err instanceof Prisma.PrismaClientValidationError) {
        message = "Invalid data provided. Please check your input.";
        error = { details: "Validation error in database query" };
        statusCode = httpStatus.BAD_REQUEST;
    }

    // Prisma Unknown Request Errors
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        message = "An unexpected database error occurred.";
        error = { details: err.message };
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    // Prisma Initialization Errors
    else if (err instanceof Prisma.PrismaClientInitializationError) {
        message = "Database connection failed. Please try again later.";
        error = { details: "Failed to initialize database client" };
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
    }

    res.status(statusCode).json({
        success,
        message,
        error,
    });
};

export default globalErrorHandler;
