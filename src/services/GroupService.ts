import {
  Expense,
  Group,
  Member,
  MemberCurrentBalance,
} from "../entities/Group.ts";
import { GroupRepository } from "./GroupRepository.ts";

export class GroupService {
  private repo: GroupRepository;

  constructor(_repo: GroupRepository) {
    this.repo = _repo;
  }

  async createGroup(_name: string, _members: Member[]): Promise<string> {
    const group = new Group(_name, _members);
    await this.repo.putGroup(group);
    return group.id;
  }

  async getGroup(groupId: string): Promise<Group> {
    const group = await this.repo.getById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    return group;
  }

  async recordExpense(groupId: string, expense: Expense): Promise<void> {
    const group = await this.getGroup(groupId);
    group.expenses.push(expense);
    await this.repo.putGroup(group);

    return;
  }

  async splitExpensesBetweenMembers(
    groupId: string,
    splitBetweenMembersIds: string[]
  ): Promise<void> {
    const group = await this.getGroup(groupId);

    if (group.expenses.length === 0) {
      throw new Error("No expenses to split");
    }

    if (splitBetweenMembersIds.length === 0) {
      throw new Error("No members provided to split the expense");
    }

    const totalExpensesAmount = group.expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );

    const amountPerMember = totalExpensesAmount / splitBetweenMembersIds.length;
    const remainder =
      totalExpensesAmount - amountPerMember * splitBetweenMembersIds.length;

    for (const member of group.members) {
      if (splitBetweenMembersIds.includes(member.id)) {
        member.updateBalance(amountPerMember);
      } else {
        member.updateBalance(-amountPerMember);
      }
    }

    if (remainder > 0) {
      const lastMember = group.members[group.members.length - 1];
      lastMember.updateBalance(remainder);
    }

    return;
  }

  async getMembersBalances(groupId: string): Promise<MemberCurrentBalance[]> {
    const group = await this.getGroup(groupId);

    const membersBalances: MemberCurrentBalance[] = [];
    for (const member of group.members) {
      const memberBalance = new MemberCurrentBalance(
        member.id,
        member.name,
        member.getBalance()
      );

      membersBalances.push(memberBalance);
    }

    return membersBalances;
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
