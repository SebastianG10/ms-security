import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Codigo2Fa, Codigo2FaRelations} from '../models';

export class Codigo2FaRepository extends DefaultCrudRepository<
  Codigo2Fa,
  typeof Codigo2Fa.prototype._id,
  Codigo2FaRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Codigo2Fa, dataSource);
  }
}
