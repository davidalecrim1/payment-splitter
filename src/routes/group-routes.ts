import { Router } from "express";
import multer from "multer";
import { FakeGroupRepository } from "../adapters/fake-group-repository.ts";
import { FakeMessageQueue } from "../adapters/fake-message-queue.ts";
import { MongoGroupRepository } from "../adapters/mongodb-group-repository.ts";
import { RabbitMessageQueue } from "../adapters/rabbit-message-queue.ts";
import { GroupController } from "../controller/group-controller.ts";
import { validateGroupIdParam } from "../controller/middleware/group.ts";
import { connectMongoDb } from "../infra/mongodb/db.ts";
import { getChannel } from "../infra/rabbitmq/rabbit-mq.ts";
import { GroupRepository } from "../services/group-repository.ts";
import { GroupService } from "../services/group-service.ts";
import { MessageQueue } from "../services/message-queue.ts";

export async function createGroupRoutes() {
  const router = Router();

  let groupRepository: GroupRepository;
  if (process.env.MOCK_DATABASE === "true") {
    groupRepository = new FakeGroupRepository();
  } else {
    await connectMongoDb();
    groupRepository = new MongoGroupRepository();
  }

  let messageQueue: MessageQueue;
  if (process.env.MOCK_MESSAGE_QUEUE === "true") {
    messageQueue = new FakeMessageQueue();
  } else {
    const queueName = "groups";
    const chan = await getChannel(queueName);
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

  return router;
}
