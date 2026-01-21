import { NextFunction, Request, Response } from "express";
import * as z from "zod";

const validateRequest =
  (schema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({ body: req.body }) as any;
      req.body = parsed.body;
      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;

