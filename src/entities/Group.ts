import { v7 as uuidv7 } from "uuid";
import { MemberNotFoundError } from "./Errors.ts";

export type MemberId = string;

export class Group {
  id: string;
  name: string;
  private members: Member[];
  private expenses: Expense[];
  private setlements: Settlement[];

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
      throw new MemberNotFoundError();
    }

    return member;
  }

  addExpense(expense: Expense) {
    this.getMember(expense.paidByMemberId);
    this.expenses.push(expense);
    // TODO: Decide if we need to update the member balance here
    // using the splitExpenses method.
  }

  splitExpenses(betweenMembers: MemberId[]): ExpenseSplit[] {
    if (this.expenses.length === 0) {
      throw new Error("No expenses to split");
    }

    if (betweenMembers.length === 0) {
      betweenMembers = this.members.map((m) => m.id);
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

  getMembersBalances(
    splitExpensesBetweenMembers?: MemberId[]
  ): MemberBalance[] {
    const expensesToBeSplited = this.splitExpenses(splitExpensesBetweenMembers);
    const membersBalances: MemberBalance[] = [];

    for (const member of this.members) {
      const paidExpenses = this.expenses.filter(
        (e) => e.paidByMemberId === member.id
      );

      const totalPaid = paidExpenses.reduce(
        (acc, expense) => acc + expense.amount,
        0
      );

      let totalSplitForMember = 0;
      expensesToBeSplited.forEach((e) => {
        if (e.memberId === member.id) {
          totalSplitForMember += e.amount;
        }
      });

      let netBalance = totalPaid - totalSplitForMember;

      // TODO: Add settlements to the balance
      this.setlements.forEach((s) => {
        if (s.fromMemberId === member.id) {
          netBalance += s.amount;
        }

        if (s.toMemberId === member.id) {
          netBalance -= s.amount;
        }
      });

      membersBalances.push(
        new MemberBalance(member.id, member.name, netBalance)
      );
    }

    return membersBalances;
  }

  amountOfMembers() {
    return this.members.length;
  }

  setttleDebts(settlement: Settlement) {
    const fromMember = this.getMember(settlement.fromMemberId);
    const toMember = this.getMember(settlement.toMemberId);
    if (fromMember.id === toMember.id) {
      throw new Error("Cannot settle debt with yourself");
    }

    this.setlements.push(settlement);
  }
}

export class Member {
  id: string;
  name: string;

  constructor(_name: string) {
    this.id = uuidv7();
    this.name = _name;
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
  fromMemberId: MemberId;
  toMemberId: MemberId;
  amount: number;

  constructor(_fromMemberId: MemberId, _toMemberId: MemberId, _amount: number) {
    this.id = uuidv7();
    this.fromMemberId = _fromMemberId;
    this.toMemberId = _toMemberId;
    this.amount = _amount;
  }
}

export class MemberBalance {
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
