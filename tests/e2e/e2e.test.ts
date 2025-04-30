import request from "supertest";
import app from "../../src/app.ts";
import { Member } from "../../src/entities/Group.ts";

describe("Payment Splitter E2E", () => {
  let groupId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post("/groups")
      .send({
        name: "trip-friends",
        members: [{ name: "david" }, { name: "marcos" }, { name: "alex" }],
      });
    expect(res.status).toBe(201);
    groupId = res.body.id;
  });

  it("should add expenses and calculate group balances", async () => {
    const res1 = await request(app).get(`/groups/${groupId}`).send();
    expect(res1.status).toBe(200);

    const members: Member[] = res1.body.members;
    expect(members.length).toBe(3);

    const res2 = await request(app)
      .post(`/groups/${groupId}/expenses`)
      .send({
        expense: {
          name: "Netflix Subscription",
          amount: 40.5,
          paidByMemberId: members[0].id,
        },
      });

    expect(res2.status).toBe(200);

    const res3 = await request(app).post(`/groups/${groupId}/balances`).send();

    expect(res3.status).toBe(200);
    expect(res3.body).toHaveLength(3);

    expect(res3.body[0].balance).toBe(26.5);
    expect(res3.body[1].balance).toBe(-13.5);
    expect(res3.body[2].balance).toBe(-13);
  });

  it("should allow settlement of expenses", async () => {
    const res1 = await request(app).get(`/groups/${groupId}`).send();
    expect(res1.status).toBe(200);

    const members: Member[] = res1.body.members;
    expect(members.length).toBe(3);

    const res2 = await request(app)
      .post(`/groups/${groupId}/expenses`)
      .send({
        expense: {
          name: "Musical on Broadway",
          amount: 100,
          paidByMemberId: members[0].id,
        },
      });

    expect(res2.status).toBe(200);

    const res3 = await request(app)
      .post(`/groups/${groupId}/settlements`)
      .send({
        settlement: {
          fromMemberId: members[1].id,
          toMemberId: members[0].id,
          amount: 33,
        },
      });
    expect(res3.status).toBe(200);

    const res4 = await request(app)
      .post(`/groups/${groupId}/settlements`)
      .send({
        settlement: {
          fromMemberId: members[2].id,
          toMemberId: members[0].id,
          amount: 33,
        },
      });

    expect(res4.status).toBe(200);

    const res5 = await request(app).post(`/groups/${groupId}/balances`).send();
    expect(res5.status).toBe(200);
    expect(res5.body).toHaveLength(3);

    expect(res5.body[0].balance).toBe(0);
    expect(res5.body[1].balance).toBe(0);
    expect(res5.body[2].balance).toBe(0);
  });
});
