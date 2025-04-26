import { v7 as uuidv7 } from "uuid";

export class Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  setlements: Settlement[];

  constructor(_name: string, _members: Member[]) {
    this.id = uuidv7();
    this.name = _name;
    this.members = _members;
    this.expenses = [];
    this.setlements = [];
  }

  getMember(memberId: string) {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }
  }
}

export class Member {
  id: string;
  name: string;
  balance: number;

  constructor(_name: string) {
    this.id = uuidv7();
    this.name = _name;
    this.balance = 0;
  }

  updateBalance(amount: number) {
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }
}

export class Expense {
  id: string;
  name: string;
  amount: number;
  paidByMemberId: string;

  constructor(_name: string, _amount: number, _paidByMemberId: string) {
    this.id = uuidv7();
    this.name = _name;
    this.amount = _amount;
    this.paidByMemberId = _paidByMemberId;
  }
}

export class Settlement {
  id: string;
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  date: Date;
}

export class MemberCurrentBalance {
  memberId: string;
  balance: number;

  constructor(_memberId: string, _name: string, _balance: number) {
    this.memberId = _memberId;
    this.balance = _balance;
  }
}
