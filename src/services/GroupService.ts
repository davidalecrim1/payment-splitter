import { GroupNotFoundError } from "../entities/Errors.ts";
import { DebtSettled, ExpenseRecorded } from "../entities/Events.ts";
import {
  Expense,
  Group,
  Member,
  MemberBalance,
  MemberId,
  Settlement,
} from "../entities/Group.ts";
import { GroupRepository } from "./GroupRepository.ts";
import { MessageQueue } from "./MessageQueue.ts";

export class GroupService {
  private repo: GroupRepository;
  private mq: MessageQueue;

  constructor(_repo: GroupRepository, _mq: MessageQueue) {
    this.repo = _repo;
    this.mq = _mq;
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
    await this.mq.Publish(new ExpenseRecorded());
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
    await this.mq.Publish(new DebtSettled());
  }
}
