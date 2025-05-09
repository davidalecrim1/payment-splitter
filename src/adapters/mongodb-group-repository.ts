import { Group } from "../entities/group.ts";
import { toDomain, toMongoDbDocument } from "../infra/mongodb/mappers.ts";
import { GroupModel } from "../infra/mongodb/models.ts";
import { GroupRepository } from "../services/group-repository.ts";

export class MongoGroupRepository implements GroupRepository {
  async putGroup(group: Group): Promise<void> {
    const data = toMongoDbDocument(group);
    await GroupModel.findByIdAndUpdate(data.id, data, {
      upsert: true,
      runValidators: true,
    });
  }
  async getById(id: string): Promise<Group | null> {
    const doc = await GroupModel.findById(id);
    if (!doc) return null;
    return toDomain(doc);
  }
}
