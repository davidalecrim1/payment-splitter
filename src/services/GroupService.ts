import { GroupNotFoundError } from "../entities/Errors.ts";
import {
  Expense,
  Group,
  Member,
  MemberBalance,
  MemberId,
  Settlement,
} from "../entities/Group.ts";
import { GroupRepository } from "./GroupRepository.ts";

export class GroupService {
  private repo: GroupRepository;

  constructor(_repo: GroupRepository) {
    this.repo = _repo;
  }

  async createGroup(name: string, members: Member[]): Promise<string> {
    const group = new Group(name, members);
    await this.repo.putGroup(group);
    return group.id;
  }

  async getGroup(groupId: string): Promise<Group> {
    const group = await this.repo.getById(groupId);
    if (!group) {
      throw new GroupNotFoundError();
    }

    return group;
  }

  async recordExpenses(groupId: string, expenses: Expense[]): Promise<void> {
    const group = await this.getGroup(groupId);
    for (const expense of expenses) {
      group.addExpense(expense);
    }
    await this.repo.putGroup(group);
  }

  async calculateMembersBalance(
    groupId: string,
    splitExpensesBetweenMembers?: MemberId[]
  ): Promise<MemberBalance[]> {
    const group = await this.getGroup(groupId);
    return group.calculateMembersBalance(splitExpensesBetweenMembers);
  }

  async addSettlement(groupId: string, settlement: Settlement): Promise<void> {
    const group = await this.getGroup(groupId);
    group.setttleDebts(settlement);
    await this.repo.putGroup(group);
  }
}
