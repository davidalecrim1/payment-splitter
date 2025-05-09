import { v7 as uuidv7 } from "uuid";
import { FakeGroupRepository } from "../../src/adapters/FakeGroupRepository.ts";
import { FakeMessageQueue } from "../../src/adapters/FakeMessageQueue.ts";
import {
  GroupNotFoundError,
  MemberNotFoundError,
} from "../../src/entities/Errors.ts";
import {
  Expense,
  Member,
  Money,
  Settlement,
} from "../../src/entities/group.ts";
import { GroupRepository } from "../../src/services/GroupRepository.ts";
import { GroupService } from "../../src/services/group-service.ts";

describe("Group Service", () => {
  let repo: GroupRepository;
  let svc: GroupService;
  let mq: FakeMessageQueue;

  beforeEach(() => {
    repo = new FakeGroupRepository();
    mq = new FakeMessageQueue();
    svc = new GroupService(repo, mq);
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
    expect(createdGroup.amountOfMembers()).toBe(members.length);
    expect(createdGroup.id).toBe(groupId);
  });

  it("shouldn't be able to retrieve an unexisting group", async () => {
    const id = uuidv7();
    await expect(svc.getGroup(id)).rejects.toThrow(GroupNotFoundError);
  });

  it("shouldn't find an unexisting member", async () => {
    const id = await svc.createGroup("Awesome Group Xray", [
      new Member("Alice"),
    ]);

    const group = await svc.getGroup(id);
    const unexistingMemberId = uuidv7();
    expect(() => group.getMember(unexistingMemberId)).toThrow(
      MemberNotFoundError
    );
  });

  it("should record an expense in a group with an event in the queue", async () => {
    const members = [new Member("Mike"), new Member("John")];
    const groupId = await svc.createGroup("Awesome Group Bravo", members);

    await svc.recordExpenses(groupId, [
      new Expense("Dinner", new Money("USD", 100), members[0].id),
    ]);

    const group = await svc.getGroup(groupId);
    expect(group.getLengthOfExpenses()).toBe(1);

    expect(mq.messages.pop()?.type).toBe("ExpenseRecorded");
  });

  it("should split expenses between ALL members", async () => {
    const members = [
      new Member("Alice"),
      new Member("Bob"),
      new Member("Mike"),
    ];
    const groupId = await svc.createGroup("Awesome Group Charlie", members);

    await svc.recordExpenses(groupId, [
      new Expense("Dinner", new Money("USD", 40), members[0].id),
      new Expense("Lunch", new Money("USD", 60), members[1].id),
    ]);

    const group = await svc.getGroup(groupId);

    // The split of expenses is made while the balance is calculated.
    const membersBalances = group.calculateMembersBalance();
    expect(membersBalances.length).toBe(members.length);

    // Alice is owned 6 because she paid 40, and the division
    // will be rounded to 34 to the first member.
    expect(membersBalances[0].memberId).toEqual(members[0].id);
    expect(membersBalances[0].balance[0].amount).toBe(6);

    // Bob is owned 27 because he paid 60, and the division
    // will be rounded to 33 to the second member.
    expect(membersBalances[1].memberId).toEqual(members[1].id);
    expect(membersBalances[1].balance[0].amount).toBe(27);

    // Mike should pay 33 to the others members because he didn't pay anything.
    expect(membersBalances[2].memberId).toEqual(members[2].id);
    expect(membersBalances[2].balance[0].amount).toBe(-33);
  });

  it("should split expenses between SOME members", async () => {
    const members = [
      new Member("John"),
      new Member("Jane"),
      new Member("Zeke"),
    ];
    const groupId = await svc.createGroup("Awesome Group Delta", members);

    await svc.recordExpenses(groupId, [
      new Expense("Breakfast", new Money("USD", 70), members[0].id),
      new Expense("Gift Shop", new Money("USD", 7), members[1].id),
    ]);

    const group = await svc.getGroup(groupId);

    // The split of expenses is made while the balance is calculated.
    const membersBalances = group.calculateMembersBalance([
      members[0].id,
      members[1].id,
    ]);
    expect(membersBalances.length).toBe(members.length);

    // John is owned 31 (paid 70 and the total is 39 for the first and 38 for the second emmber).
    expect(membersBalances[0].balance[0].amount).toBe(31);
    expect(membersBalances[0].memberId).toEqual(members[0].id);

    // Jane should pay 31 to John given the total 38 minus 7.
    expect(membersBalances[1].balance[0].amount).toBe(-31);
    expect(membersBalances[1].memberId).toEqual(members[1].id);

    // Zeke won't pay anything given he is not in the split.
    expect(membersBalances[2].balance[0].amount).toBe(0);
    expect(membersBalances[2].memberId).toEqual(members[2].id);
  });

  it("should update balances giving settlements after a SPLIT between SOME members", async () => {
    const members = [
      new Member("Gus"),
      new Member("Charles"),
      new Member("Teresa"),
    ];
    const groupId = await svc.createGroup("Awesome Group Echo", members);

    await svc.recordExpenses(groupId, [
      new Expense(
        "Tickets for Taylor Swift",
        new Money("USD", 70),
        members[0].id
      ),
      new Expense("Drinks at the bar", new Money("USD", 100), members[1].id),
    ]);

    const group = await svc.getGroup(groupId);

    const membersBalances = group.calculateMembersBalance([
      members[0].id,
      members[1].id,
    ]);
    expect(membersBalances.length).toBe(members.length);

    // Gus should pay 15 (paid 70 and the total is 85 for the first two members).
    expect(membersBalances[0].balance[0].amount).toBe(-15);
    expect(membersBalances[0].memberId).toEqual(members[0].id);

    // Charles is owned pay 15 (paid 100 and the total is 85 for the first two members).
    expect(membersBalances[1].balance[0].amount).toBe(15);
    expect(membersBalances[1].memberId).toEqual(members[1].id);

    // Teresa won't pay anything given she is not in the split.
    expect(membersBalances[2].balance[0].amount).toBe(0);
    expect(membersBalances[2].memberId).toEqual(members[2].id);

    await svc.addSettlement(
      groupId,
      new Settlement(members[0].id, members[1].id, new Money("USD", 15))
    );

    expect(mq.messages.pop()?.type).toBe("DebtSettled");

    const updatedGroup = await svc.getGroup(groupId);
    // TODO: Rethink this. It could cause a bug giving the settlement registration,
    // but I need to pass the division again.
    const updatedMembersBalances = updatedGroup.calculateMembersBalance([
      members[0].id,
      members[1].id,
    ]);

    updatedMembersBalances.map((mb, i) => {
      expect(mb.balance[0].amount).toBe(0);
      expect(mb.memberId).toEqual(members[i].id);
    });
  });

  it("should split expenses with decimal values between ALL members", async () => {
    const members = [new Member("Bruno"), new Member("Luis")];
    const groupId = await svc.createGroup("Awesome Group Charlie", members);

    await svc.recordExpenses(groupId, [
      new Expense(
        "Netflix Subscription",
        new Money("USD", 40.5),
        members[0].id
      ),
      new Expense("Steam Subscription", new Money("USD", 30.25), members[1].id),
    ]);

    const group = await svc.getGroup(groupId);

    const membersBalances = group.calculateMembersBalance();
    expect(membersBalances.length).toBe(members.length);

    expect(membersBalances[0].balance[0].amount).toBe(4.75);
    expect(membersBalances[0].memberId).toEqual(members[0].id);

    expect(membersBalances[1].balance[0].amount).toBe(-4.75);
    expect(membersBalances[1].memberId).toEqual(members[1].id);
  });

  it("should allow multiple currencies in a group with balances splitted by currency", async () => {
    const members = [new Member("David"), new Member("John")];
    const groupId = await svc.createGroup("Awesome Group Fox", members);

    await svc.recordExpenses(groupId, [
      new Expense(
        "Ice Cream at the Mall",
        new Money("USD", 40.5),
        members[0].id
      ),
      new Expense(
        "Shopping at Aliexpress",
        new Money("BRL", 1000),
        members[1].id
      ),
      new Expense("Parking Lot", new Money("USD", 30.25), members[1].id),
    ]);

    const group = await svc.getGroup(groupId);

    const membersBalances = group.calculateMembersBalance();
    expect(membersBalances.length).toBe(members.length);

    expect(membersBalances[0].memberId).toEqual(members[0].id);
    expect(membersBalances[0].balance[0].code).toBe("USD");
    expect(membersBalances[0].balance[0].amount).toBe(4.75);
    expect(membersBalances[0].balance[1].code).toBe("BRL");
    expect(membersBalances[0].balance[1].amount).toBe(-500);

    expect(membersBalances[1].memberId).toEqual(members[1].id);
    expect(membersBalances[1].balance[0].code).toBe("USD");
    expect(membersBalances[1].balance[0].amount).toBe(-4.75);
    expect(membersBalances[1].balance[1].code).toBe("BRL");
    expect(membersBalances[1].balance[1].amount).toBe(500);

    await svc.addSettlement(
      groupId,
      new Settlement(members[1].id, members[0].id, new Money("USD", 4.75))
    );

    await svc.addSettlement(
      groupId,
      new Settlement(members[0].id, members[1].id, new Money("BRL", 500))
    );

    const updatedGroup = await svc.getGroup(groupId);

    const updatedMembersBalances = updatedGroup.calculateMembersBalance();
    expect(updatedMembersBalances.length).toBe(members.length);

    expect(updatedMembersBalances[0].memberId).toEqual(members[0].id);
    expect(updatedMembersBalances[0].balance[0].code).toBe("USD");
    expect(updatedMembersBalances[0].balance[0].amount).toBe(0);
    expect(updatedMembersBalances[0].balance[1].code).toBe("BRL");
    expect(updatedMembersBalances[0].balance[1].amount).toBe(0);

    expect(updatedMembersBalances[1].memberId).toEqual(members[1].id);
    expect(updatedMembersBalances[1].balance[0].code).toBe("USD");
    expect(updatedMembersBalances[1].balance[0].amount).toBe(0);
    expect(updatedMembersBalances[1].balance[1].code).toBe("BRL");
    expect(updatedMembersBalances[1].balance[1].amount).toBe(0);
  });
});
