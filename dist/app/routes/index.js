"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const organization_routes_1 = require("../modules/organization/organization.routes");
const user_routes_1 = require("../modules/user/user.routes");
const project_routes_1 = require("../modules/project/project.routes");
const task_routes_1 = require("../modules/task/task.routes");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRoutes,
    },
    {
        path: "/organizations",
        route: organization_routes_1.organizationRoutes,
    },
    {
        path: "/users",
        route: user_routes_1.userRoutes,
    },
    {
        path: "/projects",
        route: project_routes_1.projectRoutes,
    },
    {
        path: "/tasks",
        route: task_routes_1.taskRoutes,
    },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
