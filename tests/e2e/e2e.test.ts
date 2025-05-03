import { Member } from "../../src/entities/Group.ts";
import {
  addSettlement,
  calculateBalances,
  createExpense,
  createGroup,
  getGroup,
} from "./utils.ts";

describe("Payment Splitter E2E", () => {
  let groupId: string;

  beforeEach(async () => {
    const id = await createGroup(["David", "Marcos", "John"]);
    groupId = id;
  });

  it("should add expenses and calculate group balances", async () => {
    const groupRes = await getGroup(groupId);
    const members = groupRes.members as Member[];

    await createExpense(groupId, members[0].id, "Netflix Subscription", 40.5);

    const memberBalances = await calculateBalances(groupId);
    expect(memberBalances.length).toBe(3);

    expect(memberBalances[0].balance).toBe(26.5);
    expect(memberBalances[1].balance).toBe(-13.5);
    expect(memberBalances[2].balance).toBe(-13);
  });

  it("should allow settlement of expenses", async () => {
    const groupRes = await getGroup(groupId);
    const members = groupRes.members as Member[];

    await createExpense(groupId, members[0].id, "Musical on Broadway", 100);
    await addSettlement(groupId, members[1].id, members[0].id, 33);
    await addSettlement(groupId, members[2].id, members[0].id, 33);

    const memberBalances = await calculateBalances(groupId);
    expect(memberBalances.length).toBe(3);

    expect(memberBalances[0].balance).toBe(0);
    expect(memberBalances[1].balance).toBe(0);
    expect(memberBalances[2].balance).toBe(0);
  });
});
