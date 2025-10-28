import { Router } from "express"
import AuthRoutes from "../modules/auth/auth.routes.js"
import UserRoutes from "../modules/user/user.routes.js"
import SkillProfileRoutes from "../modules/skillsProfile/skillProfile.routes.js"

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/skills", SkillProfileRoutes);

export default router;