import { Express } from "express";
import request from "supertest";
import { MemberBalance, Money } from "../../src/entities/Group.ts";

export async function createExpense(
  app: Express,
  groupId: string,
  memberId: string,
  name: string,
  currency: Money
) {
  const res = await request(app)
    .post(`/groups/${groupId}/expenses`)
    .send({ expense: { name, currency, paidByMemberId: memberId } });

  expect(res.status).toBe(200);
}

export async function getGroup(app: Express, groupId: string) {
  const res = await request(app).get(`/groups/${groupId}`).send();
  expect(res.status).toBe(200);
  return res.body;
}

export async function createGroup(app: Express, membersNames: string[]) {
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
  app: Express,
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
  app: Express,
  groupId: string,
  fromMemberId: string,
  toMemberId: string,
  currency: Money
) {
  const res = await request(app)
    .post(`/groups/${groupId}/settlements`)
    .send({
      settlement: {
        fromMemberId: fromMemberId,
        toMemberId: toMemberId,
        currency: currency,
      },
    });
  expect(res.status).toBe(200);
}
