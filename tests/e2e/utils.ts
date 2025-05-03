import request from "supertest";
import app from "../../src/app.ts";
import { MemberBalance } from "../../src/entities/Group.ts";

export async function createExpense(
  groupId: string,
  memberId: string,
  name: string,
  amount: number
) {
  const res = await request(app)
    .post(`/groups/${groupId}/expenses`)
    .send({ expense: { name, amount, paidByMemberId: memberId } });

  expect(res.status).toBe(200);
}

export async function getGroup(groupId: string) {
  const res = await request(app).get(`/groups/${groupId}`).send();
  expect(res.status).toBe(200);
  return res.body;
}

export async function createGroup(membersNames: string[]) {
  const res = await request(app)
    .post("/groups")
    .send({
      name: `grp-${Date.now()}`,
      members: membersNames.map((n) => ({ name: n })),
    });
  expect(res.status).toBe(201);
  return res.body.id as string;
}

export async function calculateBalances(
  groupId: string,
  splitExpensesBetweenMembers?: string[]
) {
  const payload = splitExpensesBetweenMembers
    ? { splitExpensesBetweenMembers }
    : {};

  const res = await request(app)
    .post(`/groups/${groupId}/balances`)
    .send(payload);

  expect(res.status).toBe(200);
  return res.body as MemberBalance[];
}

export async function addSettlement(
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  amount: number
) {
  const res = await request(app)
    .post(`/groups/${groupId}/settlements`)
    .send({
      settlement: {
        fromMemberId: fromMemberId,
        toMemberId: toMemberId,
        amount: amount,
      },
    });
  expect(res.status).toBe(200);
}
