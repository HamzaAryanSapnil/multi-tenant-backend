import express from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { organizationRoutes } from '../modules/organization/organization.routes';
import { userRoutes } from '../modules/user/user.routes';
import { projectRoutes } from '../modules/project/project.routes';
import { taskRoutes } from '../modules/task/task.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/organizations",
    route: organizationRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/projects",
    route: projectRoutes,
  },
  {
    path: "/tasks",
    route: taskRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;
