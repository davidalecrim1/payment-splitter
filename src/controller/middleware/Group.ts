import { NextFunction, Request, Response } from "express";
import { GroupIdParamSchema } from "../schemas/Group.ts";

export function validateGroupIdParam(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const parseParams = GroupIdParamSchema.safeParse(req.params);

  if (!parseParams.success) {
    res.status(400).json({
      message: "Invalid request",
      errors: parseParams.error.flatten().fieldErrors,
    });
    return;
  }

  next();
}
