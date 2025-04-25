export class Member {
  id: number;
  name: string;
}

export class Expense {
  id: number;
  name: string;
  amount: number;
  paidByMemberId: number;
}

export class Settlement {
  id: number;
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  date: Date;
}

export class Group {
  name: string;
  members: Member[];
  expenses: Expense[];
  setlements: Settlement[];
}

export class MemberBalance {
  memberId: number;
  amount: number;
}
