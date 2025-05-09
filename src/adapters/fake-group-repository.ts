import { Group } from "../entities/group.ts";
import { GroupRepository } from "../services/group-repository.ts";

export class FakeGroupRepository implements GroupRepository {
  private groups: Map<string, Group> = new Map();

  async putGroup(group: Group): Promise<void> {
    this.groups.set(group.id, group);
  }

  async getById(id: string): Promise<Group | null> {
    return this.groups.get(id) || null;
  }
}
