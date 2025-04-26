import { FakeGroupRepository } from "../../src/adapters/FakeGroupRepository.ts";
import { Expense, Member } from "../../src/entities/Group.ts";
import { GroupRepository } from "../../src/services/GroupRepository.ts";
import { GroupService } from "../../src/services/GroupService.ts";

describe("Group Service", () => {
  let repo: GroupRepository;
  let svc: GroupService;

  beforeEach(() => {
    repo = new FakeGroupRepository();
    svc = new GroupService(repo);
  });

  it("should create and retrieve a group", async () => {
    const groupName = "Awesome Group Alpha";
    const members = [
      new Member("Alice"),
      new Member("Bob"),
      new Member("Charlie"),
    ];

    const groupId = await svc.createGroup(groupName, members);
    expect(groupId).toBeDefined();

    const createdGroup = await svc.getGroup(groupId);
    expect(createdGroup).toBeDefined();
    expect(createdGroup.name).toBe(groupName);
    expect(createdGroup.members.length).toBe(members.length);
    expect(createdGroup.id).toBe(groupId);
  });

  it("should record an expense", async () => {
    const groupName = "Awesome Group Bravo";
    const memberMike = new Member("Mike");
    const memberJohn = new Member("John");

    const members = [memberMike, memberJohn];

    const groupId = await svc.createGroup(groupName, members);
    const dinnerExpense = new Expense("Dinner", 100, memberMike.id);

    await svc.recordExpense(groupId, dinnerExpense);

    const group = await svc.getGroup(groupId);
    expect(group.getAmountOfExpenses()).toBe(1);
  });

  it("should split expenses between all members", async () => {
    const memberAlice = new Member("Alice");
    const memberBob = new Member("Bob");
    const memberMike = new Member("Mike");

    const members = [memberAlice, memberBob, memberMike];

    const groupId = await svc.createGroup("Awesome Group Charlie", members);
    const dinnerExpense = new Expense("Dinner", 40, memberAlice.id);
    const lunchExpense = new Expense("Lunch", 60, memberBob.id);

    await svc.recordExpense(groupId, dinnerExpense);
    await svc.recordExpense(groupId, lunchExpense);

    await svc.splitExpenses(groupId, [memberAlice.id, memberBob.id]);

    const group = await svc.getGroup(groupId);
    const expenseSplits = await svc.splitExpenses(groupId, [
      memberAlice.id,
      memberBob.id,
      memberMike.id,
    ]);

    for (let i = 0; i < expenseSplits.length; i++) {
      const split = expenseSplits[i];

      expect(split.memberId).toBe(members[i].id);
      if (i === 0) {
        expect(split.amount).toBe(34);
      } else {
        expect(split.amount).toBe(33);
      }
    }
  });
});
