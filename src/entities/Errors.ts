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
