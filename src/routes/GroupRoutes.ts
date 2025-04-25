import { Router } from "express";
import { GroupController } from "../controller/GroupController.js";
import { GroupService } from "../services/GroupService.js";

const router = Router();

const groupService = new GroupService();
const groupController = new GroupController(groupService);

router.post("/", groupController.createGroup.bind(groupController));

export { router as GroupRoutes };
