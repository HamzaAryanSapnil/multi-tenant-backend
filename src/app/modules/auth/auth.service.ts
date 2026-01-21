import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { Secret } from "jsonwebtoken";
import { jwtHelper } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import config from "../../../config";
const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is incorrect!");
  }

  const jwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };

  const accessToken = jwtHelper.generateToken(
    jwtPayload,
    config.jwt.jwt_secret as Secret,
    "1h",
  );

  const refreshToken = jwtHelper.generateToken(
    jwtPayload,
    config.jwt.refresh_token_secret as Secret,
    "90d",
  );

  return {
    accessToken,
    refreshToken,
  };
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt.jwt_secret as Secret,
  );

  const userData = await prisma.user.findUniqueOrThrow({
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

export const AuthService = {
  login,
//   changePassword,
//   forgotPassword,
//   refreshToken,
//   resetPassword,
  getMe,
};