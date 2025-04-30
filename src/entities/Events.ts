export interface DomainEvent {
  type: string;
}

export class ExpenseRecorded implements DomainEvent {
  type: string = "ExpenseRecorded";
}

export class DebtSettled implements DomainEvent {
  type: string = "DebtSettled";
}
