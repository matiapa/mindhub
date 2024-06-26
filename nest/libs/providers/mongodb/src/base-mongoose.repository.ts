/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FilterQuery,
  UpdateQuery,
  QueryOptions,
  InsertManyOptions,
  Model,
  ClientSession,
  AggregateOptions,
  PipelineStage,
  ProjectionFields,
} from 'mongoose';
import { IPaginatedParams, UpdateResult, DeleteResult } from './types';
import { NestedKeyOf } from 'libs/utils/types/nested.type';
import _ from 'lodash';
import { ObjectId } from 'bson';
import crypto from 'crypto';

export abstract class BaseMongooseRepository<T extends object> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected count(filter?: FilterQuery<T>): Promise<number> {
    return this.model.count(filter ?? {});
  }

  protected getOne(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
    projection?: ProjectionFields<T>,
  ): Promise<T | null> {
    return this.model.findOne(filter, projection, options).lean();
  }

  protected getMany(
    filter?: FilterQuery<T>,
    populate?: NestedKeyOf<T>[],
    projection?: ProjectionFields<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    return this.model
      .find(filter ?? {}, projection, options)
      .populate((populate ?? []) as string[])
      .lean();
  }

  protected async getPaginated(
    paginated: IPaginatedParams<T>,
    filter?: FilterQuery<T>,
    options?: QueryOptions<T>,
    projection?: ProjectionFields<T>,
  ): Promise<T[]> {
    const { offset, limit, sortBy, sortOrder } = paginated;

    const sortCriteria = {};

    if (sortBy && sortOrder) {
      _.assign(sortCriteria, { [sortBy]: sortOrder });
    }

    _.assign(sortCriteria, { _id: 'desc' });

    return this.model
      .find(filter ?? {}, projection, options)
      .skip(offset)
      .limit(limit)
      .sort(sortCriteria)
      .lean();
  }

  protected async createOne(
    entity: T,
    options?: InsertManyOptions,
  ): Promise<void> {
    await this.createMany([entity], options);
  }

  protected async createMany(
    entities: T[],
    options?: InsertManyOptions,
  ): Promise<void> {
    await this.model.insertMany(entities, options);
  }

  protected async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateResult> {
    return this.model.updateOne(filter, update, options).lean();
  }

  protected updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<UpdateResult> {
    return this.model.updateMany(filter, update, options).lean();
  }

  /** The purpose of this method is to allow the insertion of multiple
    elements, replacing the exising ones. The method insertMany does
    not support upsert, and updateMany acts on a single filter
    so its not possible to evaluate document by document as we
    do here, note that bulkWrite executes on one round trip to db */
  protected async upsertMany(entities: T[]): Promise<void> {
    // TODO: Update T definition to require _id field

    const ops = entities.map((e) => ({
      replaceOne: {
        filter: { _id: (e as any)._id },
        replacement: e as any,
        upsert: true,
      },
    }));

    await this.model.bulkWrite(ops);
  }

  protected deleteOne(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<DeleteResult> {
    return this.model.deleteOne(filter, options).lean();
  }

  protected deleteMany(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<DeleteResult> {
    return this.model.deleteMany(filter, options).lean();
  }

  protected aggregate(filter: PipelineStage[], options?: AggregateOptions) {
    return this.model.aggregate(filter, options);
  }

  protected async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.model.db.startSession();

    session.startTransaction();

    const fnResult = await fn(session);

    await session.commitTransaction();

    if (!session.hasEnded) session.endSession();

    return fnResult;
  }

  protected hashObjectId(data: string): ObjectId {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    const buffer = Buffer.from(hash.substring(0, 24), 'hex');
    return new ObjectId(buffer);
  }
}
