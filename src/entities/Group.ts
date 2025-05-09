import { v7 as uuidv7 } from "uuid";
import { MemberNotFoundError, NoExpensesToSplitError } from "./errors.ts";

export type MemberId = string;

export class Group {
  id: string;
  name: string;
  protected members: Member[];
  protected expenses: Expense[];
  protected settlements: Settlement[];

  private constructor(
    id: string,
    name: string,
    members: Member[],
    expenses: Expense[],
    settlements: Settlement[]
  ) {
    this.id = id;
    this.name = name;
    this.members = members;
    this.expenses = expenses;
    this.settlements = settlements;
  }

  static create(name: string, members: Member[]): Group {
    const id = uuidv7();
    const expenses: Expense[] = [];
    const settlements: Settlement[] = [];
    return new Group(id, name, members, expenses, settlements);
  }

  static rehydrate(props: {
    id: string;
    name: string;
    members: Member[];
    expenses: Expense[];
    settlements: Settlement[];
  }): Group {
    return new Group(
      props.id,
      props.name,
      props.members,
      props.expenses,
      props.settlements
    );
  }

  getMember(memberId: string): Member {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) {
      throw new MemberNotFoundError();
    }

    return member;
  }

  addMember(member: Member): void {
    this.members.push(member);
  }

  addExpense(expense: Expense) {
    this.getMember(expense.paidByMemberId);
    this.expenses.push(expense);
    // TODO: Decide if we need to update the member balance here
    // using the splitExpenses method.
  }

  splitExpenses(
    betweenMembers: MemberId[] = this.members.map((m) => m.id)
  ): ExpenseSplit[] {
    if (this.expenses.length === 0) {
      throw new NoExpensesToSplitError();
    }

    if (betweenMembers.length === 0) {
      betweenMembers = this.members.map((m) => m.id);
    }

    const splitMap = new Map<MemberId, ExpenseSplit>();
    for (const memberId of betweenMembers) {
      splitMap.set(memberId, new ExpenseSplit(memberId, []));
    }

    for (const code of this.getCurrenciesInExpenses()) {
      const amount = this.getTotalAmountOfExpensesForCurrency(code);
      const amountPerMember = Math.floor(amount / betweenMembers.length);
      let remainder = amount % betweenMembers.length;

      for (const memberId of betweenMembers) {
        let share = amountPerMember;

        if (remainder >= 1) {
          share += 1;
          remainder -= 1;
        } else if (remainder < 1 && remainder !== 0) {
          share += remainder;
          remainder = 0;
        }

        const split = splitMap.get(memberId);
        if (!split) {
          throw new Error(`Member ${memberId} not found in splitMap`);
        }

        split.currency.push(new Money(code, share));
      }
    }

    return Array.from(splitMap.values());
  }

  private getCurrenciesInExpenses(): string[] {
    let codes = new Set<string>();
    for (const expense of this.expenses) {
      codes.add(expense.currency.code);
    }

    return Array.from(codes);
  }

  private getTotalAmountOfExpensesForCurrency(currencyCode: string) {
    return this.expenses.reduce((acc, expense) => {
      if (expense.currency.code == currencyCode) {
        return acc + expense.currency.amount;
      } else {
        return acc;
      }
    }, 0);
  }

  getLengthOfExpenses() {
    return this.expenses.length;
  }

  getExpenseByName(name: string) {
    const expense = this.expenses.find((e) => e.name === name);
    if (!expense) {
      throw new Error("Expense not found");
    }

    return expense;
  }

  calculateMembersBalance(
    splitExpensesBetweenMembers?: MemberId[]
  ): MemberBalance[] {
    const expensesToBeSplited = this.splitExpenses(splitExpensesBetweenMembers);
    const membersBalances: MemberBalance[] = [];

    for (const member of this.members) {
      let netBalances: Money[] = [];
      for (const code of this.getCurrenciesInExpenses()) {
        const totalPaid = this.getTotalPaidForMember(code, member);
        const totalSplit = this.getTotalSplitForMember(
          code,
          member,
          expensesToBeSplited
        );

        let netBalance = totalPaid - totalSplit;
        this.settlements.forEach((s) => {
          if (s.fromMemberId === member.id && s.currency.code === code) {
            netBalance += s.currency.amount;
          }

          if (s.toMemberId === member.id && s.currency.code === code) {
            netBalance -= s.currency.amount;
          }
        });

        netBalances.push(new Money(code, netBalance));
      }

      membersBalances.push(
        new MemberBalance(member.id, member.name, netBalances)
      );
    }

    return membersBalances;
  }

  private getTotalPaidForMember(currencyCode: string, member: Member): number {
    const targetCode = currencyCode.toUpperCase();

    return this.expenses
      .filter((e) => e.paidByMemberId === member.id)
      .filter((e) => e.currency.code.toUpperCase() === targetCode)
      .reduce((acc, e) => acc + e.currency.amount, 0);
  }

  private getTotalSplitForMember(
    currencyCode: string,
    member: Member,
    expensesToBeSplited: ExpenseSplit[]
  ): number {
    return expensesToBeSplited.reduce((total, split) => {
      if (split.memberId !== member.id) {
        return total;
      }

      const sumForCode = split.currency.reduce((sum, c) => {
        return c.code === currencyCode ? sum + c.amount : sum;
      }, 0);

      return total + sumForCode;
    }, 0);
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

    this.settlements.push(settlement);
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
  currency: Money;
  paidByMemberId: string;

  constructor(_name: string, _currency: Money, _paidByMemberId: string) {
    this.id = uuidv7();
    this.name = _name;
    this.currency = _currency;
    this.paidByMemberId = _paidByMemberId;
  }
}

export class Settlement {
  id: string;
  fromMemberId: MemberId;
  toMemberId: MemberId;
  currency: Money;

  constructor(
    _fromMemberId: MemberId,
    _toMemberId: MemberId,
    _currency: Money
  ) {
    this.id = uuidv7();
    this.fromMemberId = _fromMemberId;
    this.toMemberId = _toMemberId;
    this.currency = _currency;
  }
}

export class MemberBalance {
  memberId: string;
  balance: Money[];

  constructor(_memberId: string, _name: string, _balance: Money[]) {
    this.memberId = _memberId;
    this.balance = _balance;
  }
}

export class ExpenseSplit {
  memberId: string;
  currency: Money[];

  constructor(_memberId: string, _currency: Money[]) {
    this.memberId = _memberId;
    this.currency = _currency;
  }
}

export class Money {
  readonly code: string;
  readonly amount: number;

  constructor(_code: string, _amount: number) {
    this.code = _code;
    this.amount = _amount;
  }
}
