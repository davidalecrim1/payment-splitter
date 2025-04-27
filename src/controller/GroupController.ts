import type { NextFunction, Request, Response } from "express";
import { GroupNotFoundError, MemberNotFoundError } from "../entities/Errors.ts";
import { Expense, Group, Member, Settlement } from "../entities/Group.ts";
import { GroupService } from "../services/GroupService.js";
import {
  AddSettlementRequestSchema,
  CreateGroupRequestSchema,
  GetMembersBalancesRequestSchema,
  RecordExpenseRequestSchema,
} from "./schemas/Group.ts";

export class GroupController {
  private svc: GroupService;

  constructor(svc: GroupService) {
    this.svc = svc;
  }

  async createGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const parseRequest = CreateGroupRequestSchema.safeParse(req.body);
    if (!parseRequest.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseRequest.error.flatten().fieldErrors,
      });
      return;
    }

    const createdMembers = parseRequest.data.members.map(
      (member) => new Member(member.name)
    );

    try {
      const groupId = await this.svc.createGroup(
        parseRequest.data.name,
        createdMembers
      );
      res
        .status(201)
        .json({ id: groupId, message: "Group created successfully" });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getGroup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Group | void> {
    try {
      const groupId = req.params.groupId;
      const group = await this.svc.getGroup(groupId);
      // TODO: Should I format group to a response object?
      res.status(200).json(group);
    } catch (error) {
      if (error instanceof GroupNotFoundError) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async recordExpense(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const parseRequest = RecordExpenseRequestSchema.safeParse(req.body);
    if (!parseRequest.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseRequest.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const groupId = req.params.groupId;
      const expense = new Expense(
        parseRequest.data.expense.name,
        parseRequest.data.expense.amount,
        parseRequest.data.expense.paidByMemberId
      );

      await this.svc.recordExpense(groupId, expense);
      res.status(200).json({ message: "Expense recorded successfully" });
    } catch (error) {
      if (
        error instanceof GroupNotFoundError ||
        error instanceof MemberNotFoundError
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      console.error("Error recording expense:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getMembersBalances(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const parseRequest = GetMembersBalancesRequestSchema.safeParse(req.body);
    if (!parseRequest.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseRequest.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const groupId = req.params.groupId;
      const balances = await this.svc.getMembersBalances(
        groupId,
        parseRequest.data.splitExpensesBetweenMembers
      );
      res.status(200).json(balances);
    } catch (error) {
      if (
        error instanceof GroupNotFoundError ||
        error instanceof MemberNotFoundError
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      console.error("Error fetching member balances:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async addSettlement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const parseRequest = AddSettlementRequestSchema.safeParse(req.body);
    if (!parseRequest.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseRequest.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const groupId = req.params.groupId;
      const settlement = new Settlement(
        parseRequest.data.settlement.fromMemberId,
        parseRequest.data.settlement.toMemberId,
        parseRequest.data.settlement.amount
      );

      await this.svc.addSettlement(groupId, settlement);
      res.status(200).json({ message: "Settlement added successfully" });
    } catch (error) {
      if (
        error instanceof GroupNotFoundError ||
        error instanceof MemberNotFoundError
      ) {
        res.status(400).json({
          message: error.message,
        });
        return;
      }

      console.error("Error adding settlement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
