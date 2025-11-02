import { Router } from "express";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { offeredSkillSchema, requiredSkillSchema } from "./skillProfile.validator.js";
import { addOfferedSkill, addRequiredSkill, getMyOfferedSkills, getMyRequiredSkills } from "./skillProfile.controller.js";
import { verifyJwt } from "../../middlewares/auth.middleware.js";


const router = Router();

router.get("/my-offered-skill", verifyJwt,  getMyOfferedSkills);

router.post("/my-offered-skill", verifyJwt,  getMyRequiredSkills);

router.post("/add-offered-skill", verifyJwt, validateRequest(offeredSkillSchema), addOfferedSkill);

router.post("/add-required-skill", verifyJwt, validateRequest(requiredSkillSchema), addRequiredSkill);

export default router;