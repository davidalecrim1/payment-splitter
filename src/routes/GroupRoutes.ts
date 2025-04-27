import { Router } from "express";
import { FakeGroupRepository } from "../adapters/FakeGroupRepository.ts";
import { GroupController } from "../controller/GroupController.js";
import { validateGroupIdParam } from "../controller/middleware/Group.ts";
import { GroupRepository } from "../services/GroupRepository.ts";
import { GroupService } from "../services/GroupService.js";

const router = Router();

let groupRepository: GroupRepository = null;
if (process.env.MOCK_DATABASE == "true") {
  groupRepository = new FakeGroupRepository();
} else {
  // TODO: Add DynamoDB
}
const groupService = new GroupService(groupRepository);
const groupController = new GroupController(groupService);

router.post("/", groupController.createGroup.bind(groupController));

router.get(
  "/:groupId",
  validateGroupIdParam,
  groupController.getGroup.bind(groupController)
);

router.post(
  "/:groupId/expenses",
  validateGroupIdParam,
  groupController.recordExpense.bind(groupController)
);

router.post(
  "/:groupId/balances",
  validateGroupIdParam,
  groupController.getMembersBalances.bind(groupController)
);

router.post(
  "/:groupId/settlements",
  validateGroupIdParam,
  groupController.addSettlement.bind(groupController)
);

export { router as GroupRoutes };
