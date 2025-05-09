import { z } from "zod";
import { MemberId } from "../../entities/group.ts";

export const CreateGroupRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    )
    .min(1, "At least one member is required"),
});

export const GroupIdParamSchema = z.object({
  // TODO: Improve to validate a UUID
  groupId: z.string().min(1, "Group ID is required"),
});

export const RecordExpenseRequestSchema = z.object({
  expense: z.object({
    name: z.string().min(1, "Name is required"),
    currency: z.object({
      amount: z.number().positive("Amount must be positive"),
      code: z.string().min(1, "Should be a valid currency code"),
    }),
    paidByMemberId: z.string().min(1, "Paid by is required"),
  }),
});

export const calculateMembersBalanceRequestSchema = z.object({
  splitExpensesBetweenMembers: z.array(z.string()).optional().default([]),
});

export const AddSettlementRequestSchema = z.object({
  settlement: z.object({
    fromMemberId: z.string().min(1, "From is required"),
    toMemberId: z.string().min(1, "To is required"),
    currency: z.object({
      amount: z.number().positive("Amount must be positive"),
      code: z.string().min(1, "Should be a valid currency code"),
    }),
  }),
});

export interface CsvExpensesRequest {
  name: string;
  currencyCode: string;
  currencyAmount: string;
  paidByMemberId: MemberId;
}
