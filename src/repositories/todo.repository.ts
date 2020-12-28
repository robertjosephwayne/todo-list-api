import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {Todo, TodoRelations, CustomUser} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CustomUserRepository} from './custom-user.repository';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {

  public readonly customUser: BelongsToAccessor<CustomUser, typeof Todo.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomUserRepository') protected customUserRepositoryGetter: Getter<CustomUserRepository>,
  ) {
    super(Todo, dataSource);
    this.customUser = this.createBelongsToAccessorFor('customUser', customUserRepositoryGetter,);
    this.registerInclusionResolver('customUser', this.customUser.inclusionResolver);
  }
}
