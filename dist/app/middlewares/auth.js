"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const jwtHelper_1 = require("../helper/jwtHelper");
const auth = (...roles) => async (req, _res, next) => {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        const decoded = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwt_secret);
        req.user = decoded;
        if (roles.length && !roles.includes(decoded.role)) {
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = auth;
