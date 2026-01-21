"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../shared/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtHelper_1 = require("../../helper/jwtHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const login = async (payload) => {
    const user = await prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
        },
    });
    const isCorrectPassword = await bcryptjs_1.default.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Password is incorrect!");
    }
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
    };
    const accessToken = jwtHelper_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt.jwt_secret, "1h");
    const refreshToken = jwtHelper_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt.refresh_token_secret, "90d");
    return {
        accessToken,
        refreshToken,
    };
};
const getMe = async (session) => {
    const accessToken = session.accessToken;
    const decodedData = jwtHelper_1.jwtHelper.verifyToken(accessToken, config_1.default.jwt.jwt_secret);
    const userData = await prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
        },
    });
    const { id, email, role, organizationId } = userData;
    return {
        id,
        email,
        role,
        organizationId,
    };
};
exports.AuthService = {
    login,
    //   changePassword,
    //   forgotPassword,
    //   refreshToken,
    //   resetPassword,
    getMe,
};
