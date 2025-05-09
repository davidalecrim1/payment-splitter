export class MemberNotFoundError extends Error {
  name: string;
  constructor(message: string = "Member not found") {
    super(message);
    this.name = "MemberNotFoundError";
  }
}

export class GroupNotFoundError extends Error {
  name: string;
  constructor(message: string = "Group not found") {
    super(message);
    this.name = "GroupNotFoundError";
  }
}

export class NoExpensesToSplitError extends Error {
  name: string;
  constructor(message: string = "No expenses to split") {
    super(message);
    this.name = "NoExpensesToSplitError";
  }
}
