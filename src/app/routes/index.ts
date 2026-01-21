import express from 'express';

const router = express.Router();

const moduleRoutes = [
    // {
    //     path: '/user',
    //     route: userRoutes
    // },
    // Add your module routes here
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;
