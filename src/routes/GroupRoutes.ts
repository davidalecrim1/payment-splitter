import { Router } from "express";
import { FakeGroupRepository } from "../adapters/FakeGroupRepository.ts";
import { GroupController } from "../controller/GroupController.js";
import { GroupService } from "../services/GroupService.js";

const router = Router();

// TODO: Replace with concrete implementation using DynamoDB
const groupRepository = new FakeGroupRepository();
const groupService = new GroupService(groupRepository);
const groupController = new GroupController(groupService);

router.post("/", groupController.createGroup.bind(groupController));

export { router as GroupRoutes };
