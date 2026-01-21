"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validateRequest = (schema) => (req, _res, next) => {
    try {
        const parsed = schema.parse({ body: req.body });
        req.body = parsed.body;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = validateRequest;
