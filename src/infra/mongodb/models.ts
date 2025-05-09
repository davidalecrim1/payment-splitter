import mongoose, { Schema } from "mongoose";

const MoneySchema = new Schema(
  {
    code: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const MemberSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const ExpenseSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    currency: { type: MoneySchema, required: true },
    paidByMemberId: { type: String, required: true },
  },
  { _id: false }
);

const SettlementSchema = new Schema(
  {
    id: { type: String, required: true },
    fromMemberId: { type: String, required: true },
    toMemberId: { type: String, required: true },
    currency: { type: MoneySchema, required: true },
  },
  { _id: false }
);

const GroupSchema = new Schema({
  _id: { type: String, required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  members: { type: [MemberSchema], required: true },
  expenses: { type: [ExpenseSchema], required: false },
  setlements: { type: [SettlementSchema], required: false },
});

export const GroupModel = mongoose.model("Group", GroupSchema);
