import { Router } from "express";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { offeredSkillSchema, requiredSkillSchema } from "./skillProfile.validator.js";
import { addOfferedSkill, addRequiredSkill } from "./skillProfile.controller.js";


const router = Router();

router.post("/add-offered-skill", validateRequest(offeredSkillSchema), addOfferedSkill);

router.post("/add-required-skill", validateRequest(requiredSkillSchema), addRequiredSkill);

export default router;