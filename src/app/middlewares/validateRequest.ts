import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest =
  (schema: ZodSchema) =>
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

