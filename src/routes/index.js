import {Router} from "express"
import UserRoutes from "../modules/auth/auth.routes.js"

const router = Router();

router.use("/auth", UserRoutes);

export default router;