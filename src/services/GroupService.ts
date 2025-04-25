import { Expense, Group, MemberBalance } from "../entities/Group.js";

export class GroupService {
  async createGroup(groupName: string, members: string[]): Promise<Group> {
    // TODO: Implement the logic.
    return;
  }

  async getGroup(groupId: number): Promise<Group> {
    // TODO: Implement the logic.
    return;
  }

  async recordExpense(
    expenseName: string,
    amount: number,
    paidByMemberId: number,
    groupId: number
  ): Promise<void> {
    // TODO: Implement the logic.
    return;
  }

  async getExpenses(groupId: number): Promise<Expense[]> {
    // TODO: Implement the logic.
    return [];
  }

  async getMembersBalances(groupId: number): Promise<MemberBalance[]> {
    // TODO: Implement the logic.
    return [];
  }

  async getMemberBalance(
    groupId: number,
    memberId: number
  ): Promise<MemberBalance> {
    // TODO: Implement the logic.
    return;
  }

  async addSettlement(
    fromMemberId: number,
    toMemberId: number,
    amount: number,
    groupId: number
  ): Promise<void> {
    // TODO: Implement the logic.
    return;
  }

  async getSettlements(groupId: number): Promise<any[]> {
    // TODO: Implement the logic.
    return [];
  }
}
