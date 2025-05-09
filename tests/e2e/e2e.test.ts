import { Express } from "express";
import { createApp } from "../../src/app.ts";
import { Member, Money } from "../../src/entities/group.ts";
import {
  addSettlement,
  calculateBalances,
  createExpense,
  createGroup,
  getGroup,
} from "./utils.ts";

describe("Payment Splitter E2E", () => {
  let groupId: string;
  let app: Express;

  beforeAll(async () => {
    process.env.MOCK_MESSAGE_QUEUE = "true"; // TODO: Add tests containers for this.
    process.env.MOCK_DATABASE = "true"; // TODO: Add tests containers for this.
    app = await createApp();
  });

  beforeEach(async () => {
    const id = await createGroup(app, ["David", "Marcos", "John"]);
    groupId = id;
  });

  it("should add expenses and calculate group balances", async () => {
    const groupRes = await getGroup(app, groupId);
    const members = groupRes.members as Member[];

    await createExpense(
      app,
      groupId,
      members[0].id,
      "Netflix Subscription",
      new Money("USD", 40.5)
    );

    const memberBalances = await calculateBalances(app, groupId);
    expect(memberBalances.length).toBe(3);

    expect(memberBalances[0].balance[0].code).toBe("USD");
    expect(memberBalances[0].balance[0].amount).toBe(26.5);
    expect(memberBalances[1].balance[0].code).toBe("USD");
    expect(memberBalances[1].balance[0].amount).toBe(-13.5);
    expect(memberBalances[2].balance[0].code).toBe("USD");
    expect(memberBalances[2].balance[0].amount).toBe(-13);
  });

  it("should allow settlement of expenses", async () => {
    const groupRes = await getGroup(app, groupId);
    const members = groupRes.members as Member[];

    await createExpense(
      app,
      groupId,
      members[0].id,
      "Musical on Broadway",
      new Money("USD", 100)
    );
    await addSettlement(
      app,
      groupId,
      members[1].id,
      members[0].id,
      new Money("USD", 33)
    );
    await addSettlement(
      app,
      groupId,
      members[2].id,
      members[0].id,
      new Money("USD", 33)
    );

    const memberBalances = await calculateBalances(app, groupId);
    expect(memberBalances.length).toBe(3);

    expect(memberBalances[0].balance[0].code).toBe("USD");
    expect(memberBalances[0].balance[0].amount).toBe(0);
    expect(memberBalances[1].balance[0].code).toBe("USD");
    expect(memberBalances[1].balance[0].amount).toBe(0);
    expect(memberBalances[2].balance[0].code).toBe("USD");
    expect(memberBalances[2].balance[0].amount).toBe(0);
  });
});
