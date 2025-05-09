import { Group } from "../entities/group.ts";

export interface GroupRepository {
  putGroup(group: Group): Promise<void>;
  getById(id: string): Promise<Group | null>;
}
