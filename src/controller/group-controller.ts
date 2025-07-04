import { parse } from "csv-parse/sync";
import type { NextFunction, Request, Response } from "express";
import {
  GroupNotFoundError,
  MemberNotFoundError,
  NoExpensesToSplitError,
} from "../entities/errors.ts";
import { Expense, Member, Settlement } from "../entities/group.ts";
import { GroupService } from "../services/group-service.ts";
import {
  AddSettlementRequestSchema,
  calculateMembersBalanceRequestSchema,
  CreateGroupRequestSchema,
  CsvExpensesRequest,
  RecordExpenseRequestSchema,
} from "./schemas/group.ts";

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
  ): Promise<void> {
    try {
      const groupId = req.params.groupId;
      const group = await this.svc.getGroup(groupId);
      // TODO: Should I format group to a response object?
      // For now the standard format works fine.
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
        parseRequest.data.expense.currency,
        parseRequest.data.expense.paidByMemberId
      );

      await this.svc.recordExpenses(groupId, [expense]);
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

  async calculateMembersBalance(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const parseRequest = calculateMembersBalanceRequestSchema.safeParse(
      req.body
    );
    if (!parseRequest.success) {
      res.status(400).json({
        message: "Invalid request",
        errors: parseRequest.error.flatten().fieldErrors,
      });
      return;
    }

    try {
      const groupId = req.params.groupId;
      const balances = await this.svc.calculateMembersBalance(
        groupId,
        parseRequest.data.splitExpensesBetweenMembers
      );

      res.status(200).json(balances);
    } catch (error) {
      if (
        error instanceof GroupNotFoundError ||
        error instanceof MemberNotFoundError ||
        error instanceof NoExpensesToSplitError
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
        parseRequest.data.settlement.currency
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

  async uploadExpensesFromCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const groupId = req.params.groupId;

      if (!req.file) {
        res.status(400).json({
          message: "Invalid file provided",
        });
        return;
      }

      const csvContent = req.file.buffer.toString("utf-8");
      const expensesReq = parse(csvContent, {
        columns: true, // first line of CSV becomes object keys
        skip_empty_lines: true,
        trim: true,
        delimiter: ";",
      }) as CsvExpensesRequest[];

      const expenses = expensesReq.map((e) => {
        return new Expense(
          e.name,
          { code: e.currencyCode, amount: parseFloat(e.currencyAmount) },
          e.paidByMemberId
        );
      });

      await this.svc.recordExpenses(groupId, expenses);
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

      console.error("Error adding settlement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
