import { Expense, Settlement } from "./Group.ts";

export interface DomainEvent {
  type: string;
}

export class ExpenseRecorded implements DomainEvent {
  type: string = "ExpenseRecorded";
  groupId: string;
  expense: Expense;

  constructor(_groupId: string, _expense: Expense) {
    this.groupId = _groupId;
    this.expense = _expense;
  }
}

export class DebtSettled implements DomainEvent {
  type: string = "DebtSettled";
  groupId: string;
  settlement: Settlement;

  constructor(_groupId: string, _settlement: Settlement) {
    this.groupId = _groupId;
    this.settlement = _settlement;
  }
}
