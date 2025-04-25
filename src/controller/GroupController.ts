import type { NextFunction, Request, Response } from "express";
import { GroupService } from "../services/GroupService.js";

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
    try {
      await this.svc.createGroup(req.body.groupName, req.body.members);
      res.status(201).json({ message: "Group created successfully" });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
