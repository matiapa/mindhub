import { NestedKeyOf } from 'libs/utils/types/nested.type';
import { SortOrder, ObjectId } from 'mongoose';

export declare interface UpdateResult {
  /** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined */
  acknowledged: boolean;
  /** The number of documents that matched the filter */
  matchedCount: number;
  /** The number of documents that were modified */
  modifiedCount: number;
  /** The number of documents that were upserted */
  upsertedCount: number;
  /** The identifier of the inserted document if an upsert took place */
  upsertedId: ObjectId;
}

export declare interface DeleteResult {
  /** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined. */
  acknowledged: boolean;
  /** The number of documents that were deleted */
  deletedCount: number;
}

export interface IPaginatedParams<T extends object> {
  offset: number;
  limit: number;
  sortBy?: NestedKeyOf<T>;
  sortOrder?: SortOrder;
}
