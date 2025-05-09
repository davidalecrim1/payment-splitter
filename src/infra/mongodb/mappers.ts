import { Group } from "../../entities/group.ts";

export const toMongoDbDocument = (group: Group) => {
  return {
    id: group.id,
    name: group.name,
    members: group["members"],
    expenses: group["expenses"],
    settlements: group["settlements"],
  };
};

export const toDomain = (doc: any): Group => {
  return Group.rehydrate({
    id: doc.id,
    name: doc.name,
    members: doc.members,
    expenses: doc.expenses,
    settlements: doc.settlements,
  });
};
