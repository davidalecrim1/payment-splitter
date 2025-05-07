import { Router } from "express";
import multer from "multer";
import { FakeGroupRepository } from "../adapters/FakeGroupRepository.ts";
import { FakeMessageQueue } from "../adapters/FakeMessageQueue.ts";
import { RabbitMessageQueue } from "../adapters/RabbitMessageQueue.ts";
import { GroupController } from "../controller/GroupController.ts";
import { validateGroupIdParam } from "../controller/middleware/Group.ts";
import { getChannel } from "../infra/RabbitMq.ts";
import { GroupRepository } from "../services/GroupRepository.ts";
import { GroupService } from "../services/GroupService.ts";
import { MessageQueue } from "../services/MessageQueue.ts";

const router = Router();

let groupRepository: GroupRepository;

if (process.env.MOCK_DATABASE === "false") {
  // TODO: Add a real database here.
  throw new Error("DynamoDB implementation is not yet available.");
} else {
  groupRepository = new FakeGroupRepository();
}

let messageQueue: MessageQueue;
if (process.env.MOCK_MESSAGE_QUEUE === "true") {
  messageQueue = new FakeMessageQueue();
} else {
  const queueName = "groups";
  let chan = await getChannel(queueName);
  messageQueue = new RabbitMessageQueue(chan, queueName);
}

const groupService = new GroupService(groupRepository, messageQueue);
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
  groupController.calculateMembersBalance.bind(groupController)
);

router.post(
  "/:groupId/settlements",
  validateGroupIdParam,
  groupController.addSettlement.bind(groupController)
);

const csvUploaderMiddleware = multer({ storage: multer.memoryStorage() });
router.post(
  "/:groupId/upload-csv",
  csvUploaderMiddleware.single("file"),
  groupController.uploadExpensesFromCsv.bind(groupController)
);

export { router as GroupRoutes };
