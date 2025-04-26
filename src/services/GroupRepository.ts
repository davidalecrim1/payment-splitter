import { Group } from "../entities/Group.ts";

export interface GroupRepository {
  putGroup(group: Group): Promise<void>;
  getById(id: string): Promise<Group | null>;
}
