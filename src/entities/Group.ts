import { v7 as uuidv7 } from "uuid";

export class Group {
  id: string;
  name: string;
  members: Member[];
  private expenses: Expense[];
  setlements: Settlement[];

  constructor(_name: string, _members: Member[]) {
    this.id = uuidv7();
    this.name = _name;
    this.members = _members;
    this.expenses = [];
    this.setlements = [];
  }

  getMember(memberId: string): Member {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  }

  addExpense(expense: Expense) {
    this.expenses.push(expense);
    // TODO: Decide if we need to update the member balance here
    // using the splitExpenses method.
  }

  splitExpenses(betweenMembers: string[]): ExpenseSplit[] {
    if (this.expenses.length === 0) {
      throw new Error("No expenses to split");
    }

    if (betweenMembers.length === 0) {
      throw new Error("No members provided to split the expense");
    }

    const totalAmount = this.expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );

    const amountPerMember = Math.floor(totalAmount / betweenMembers.length);
    let remainder = totalAmount % betweenMembers.length;

    const expenseSplits: ExpenseSplit[] = [];
    for (let i = 0; i < betweenMembers.length; i++) {
      const memberId = betweenMembers[i];

      let share = amountPerMember;
      if (remainder > 0) {
        share += 1;
        remainder -= 1;
      }

      expenseSplits.push(new ExpenseSplit(memberId, share));
    }

    return expenseSplits;
  }

  getAmountOfExpenses() {
    return this.expenses.length;
  }

  getExpenseByName(name: string) {
    const expense = this.expenses.find((e) => e.name === name);
    if (!expense) {
      throw new Error("Expense not found");
    }

    return expense;
  }

  getMembersBalances(): MemberCurrentBalance[] {
    const membersBalances: MemberCurrentBalance[] = [];

    for (const member of this.members) {
      const memberBalance = new MemberCurrentBalance(
        member.id,
        member.name,
        member.getBalance()
      );

      membersBalances.push(memberBalance);
    }

    return membersBalances;
  }

  getMemberBalance(memberId: string): MemberCurrentBalance {
    const member = this.getMember(memberId);

    return new MemberCurrentBalance(
      member.id,
      member.name,
      member.getBalance()
    );
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

  // The goal is to override the current balance given the splitExpenses updates
  // all balances in every new expense added to the group.
  // TODO: Review this design decision, if this ends up giving performance issues,
  // refactor this to use a different approach.
  putBalance(amount: number) {
    this.balance = amount;
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

export class ExpenseSplit {
  memberId: string;
  amount: number;

  constructor(_memberId: string, _amount: number) {
    this.memberId = _memberId;
    this.amount = _amount;
  }
}
