import { FakeGroupRepository } from "../../src/adapters/FakeGroupRepository.ts";
import { FakeMessageQueue } from "../../src/adapters/FakeMessageQueue.ts";
import { Expense, Member, Settlement } from "../../src/entities/Group.ts";
import { GroupRepository } from "../../src/services/GroupRepository.ts";
import { GroupService } from "../../src/services/GroupService.ts";

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

  it("should record an expense in a group with an event in the queue", async () => {
    const groupName = "Awesome Group Bravo";
    const memberMike = new Member("Mike");
    const memberJohn = new Member("John");

    const members = [memberMike, memberJohn];

    const groupId = await svc.createGroup(groupName, members);
    const dinnerExpense = new Expense("Dinner", 100, memberMike.id);

    await svc.recordExpenses(groupId, [dinnerExpense]);

    const group = await svc.getGroup(groupId);
    expect(group.getAmountOfExpenses()).toBe(1);
    expect(mq.messages.pop()?.type).toBe("ExpenseRecorded");
  });

  it("should split expenses between ALL members", async () => {
    const memberAlice = new Member("Alice");
    const memberBob = new Member("Bob");
    const memberMike = new Member("Mike");

    const members = [memberAlice, memberBob, memberMike];

    const groupId = await svc.createGroup("Awesome Group Charlie", members);
    const dinnerExpense = new Expense("Dinner", 40, memberAlice.id);
    const lunchExpense = new Expense("Lunch", 60, memberBob.id);

    await svc.recordExpenses(groupId, [dinnerExpense, lunchExpense]);

    const group = await svc.getGroup(groupId);

    // The split of expenses is made while the balance is calculated.
    const membersBalances = group.calculateMembersBalance();
    expect(membersBalances.length).toBe(members.length);

    const aliceBalance = membersBalances.find(
      (balance) => balance.memberId === memberAlice.id
    );

    // Alice is owned 6 because she paid 40, and the division
    // will be rounded to 34 to the first member.
    expect(aliceBalance?.balance).toBe(6);

    const bobBalance = membersBalances.find(
      (balance) => balance.memberId === memberBob.id
    );
    // Bob is owned 27 because he paid 60, and the division
    // will be rounded to 33 to the second member.
    expect(bobBalance?.balance).toBe(27);

    const mikeBalance = membersBalances.find(
      (balance) => balance.memberId === memberMike.id
    );

    // Mike should pay 33 to the others members because he didn't pay anything.
    expect(mikeBalance?.balance).toBe(-33);
  });

  it("should split expenses between SOME members", async () => {
    const memberJohn = new Member("John");
    const memberJane = new Member("Jane");
    const memberZeke = new Member("Zeke");

    const members = [memberJohn, memberJane, memberZeke];

    const groupId = await svc.createGroup("Awesome Group Delta", members);
    const breakfastExpense = new Expense("Breakfast", 70, memberJohn.id);
    const giftshopExpense = new Expense("Gift Shop", 7, memberJane.id);

    await svc.recordExpenses(groupId, [breakfastExpense, giftshopExpense]);

    const group = await svc.getGroup(groupId);

    // The split of expenses is made while the balance is calculated.
    const membersBalances = group.calculateMembersBalance([
      memberJohn.id,
      memberJane.id,
    ]);
    expect(membersBalances.length).toBe(members.length);

    const johnBalance = membersBalances.find(
      (balance) => balance.memberId === memberJohn.id
    );

    // John is owned 31 (paid 70 and the total is 39 for the first and 38 for the second emmber).
    expect(johnBalance?.balance).toBe(31);

    const janeBalance = membersBalances.find(
      (balance) => balance.memberId === memberJane.id
    );

    // Jane should pay 31 to John given the total 38 minus 7.
    expect(janeBalance?.balance).toBe(-31);

    const mikeBalance = membersBalances.find(
      (balance) => balance.memberId === memberZeke.id
    );

    // Mike won't pay anything given he is not in the split.
    expect(mikeBalance?.balance).toBe(0);
  });

  it("should update balances giving settlements after a SPLIT between SOME members", async () => {
    const memberGus = new Member("Gus");
    const memberCharles = new Member("Charles");
    const memberTeresa = new Member("Teresa");
    const members = [memberGus, memberCharles, memberTeresa];
    const groupId = await svc.createGroup("Awesome Group Echo", members);

    const liveShowExpense = new Expense(
      "Tickets for Taylor Swift",
      70,
      memberGus.id
    );

    const drinksExpense = new Expense(
      "Drinks at the bar",
      100,
      memberCharles.id
    );

    await svc.recordExpenses(groupId, [liveShowExpense, drinksExpense]);

    const group = await svc.getGroup(groupId);

    const membersBalances = group.calculateMembersBalance([
      memberGus.id,
      memberCharles.id,
    ]);
    expect(membersBalances.length).toBe(members.length);

    const gusBalance = membersBalances.find(
      (balance) => balance.memberId === memberGus.id
    );

    // Gus should pay 15 (paid 70 and the total is 85 for the first two members).
    expect(gusBalance?.balance).toBe(-15);

    const charlesBalance = membersBalances.find(
      (balance) => balance.memberId === memberCharles.id
    );

    // Charles is owned pay 15 (paid 100 and the total is 85 for the first two members).
    expect(charlesBalance?.balance).toBe(15);

    const teresaBalance = membersBalances.find(
      (balance) => balance.memberId === memberTeresa.id
    );

    // Teresa won't pay anything given she is not in the split.
    expect(teresaBalance?.balance).toBe(0);

    const settleBetweenGusAndCharles = new Settlement(
      memberGus.id,
      memberCharles.id,
      15
    );

    await svc.addSettlement(groupId, settleBetweenGusAndCharles);
    expect(mq.messages.pop()?.type).toBe("DebtSettled");

    const updatedGroup = await svc.getGroup(groupId);

    // TODO: Rethink this. It could cause a bug giving the settlement registration, but I need to pass the division again.
    const updatedMembersBalances = updatedGroup.calculateMembersBalance([
      memberGus.id,
      memberCharles.id,
    ]);

    const updatedGusBalance = updatedMembersBalances.find(
      (balance) => balance.memberId === memberGus.id
    );
    expect(updatedGusBalance?.balance).toBe(0);

    const updatedCharlesBalance = updatedMembersBalances.find(
      (balance) => balance.memberId === memberCharles.id
    );
    expect(updatedCharlesBalance?.balance).toBe(0);
  });

  it("should split expenses with decimal values between ALL members", async () => {
    const memberBruno = new Member("Bruno");
    const memberLuis = new Member("Luis");
    const members = [memberBruno, memberLuis];

    const groupId = await svc.createGroup("Awesome Group Charlie", members);
    const netflixExpense = new Expense(
      "Netflix Subscription",
      40.5,
      memberBruno.id
    );
    const steamExpense = new Expense(
      "Steam Subscription",
      30.25,
      memberLuis.id
    );

    await svc.recordExpenses(groupId, [netflixExpense, steamExpense]);
    const group = await svc.getGroup(groupId);

    const membersBalances = group.calculateMembersBalance();
    expect(membersBalances.length).toBe(members.length);

    const brunoBalance = membersBalances.find(
      (balance) => balance.memberId === memberBruno.id
    );
    expect(brunoBalance?.balance).toBe(4.75);

    const luisBalance = membersBalances.find(
      (balance) => balance.memberId === memberLuis.id
    );
    expect(luisBalance?.balance).toBe(-4.75);
  });
});
