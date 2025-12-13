import { Router } from "express";
import AuthRoutes from "../modules/auth/auth.routes.js";
import UserRoutes from "../modules/user/user.routes.js";
import SkillProfileRoutes from "../modules/skillsProfile/skillProfile.routes.js";
import TradeSkillRoutes from "../modules/tradeSkills/route.js";
import AIRoutes from "../modules/ai/ai.routes.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/skills", SkillProfileRoutes);
router.use("/trade-skills", TradeSkillRoutes);
router.use("/ai", AIRoutes);

export default router;
