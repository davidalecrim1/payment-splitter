import { Expense, ExpenseSplit, Group, Member } from "../entities/Group.ts";
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
    group.addExpense(expense);
    await this.repo.putGroup(group);
  }

  async splitExpenses(
    groupId: string,
    splitBetweenMembersIds: string[]
  ): Promise<ExpenseSplit[]> {
    const group = await this.getGroup(groupId);
    const expenseSplits = group.splitExpenses(splitBetweenMembersIds);
    await this.repo.putGroup(group);
    return expenseSplits;
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
