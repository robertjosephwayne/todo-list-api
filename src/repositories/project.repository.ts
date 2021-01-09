import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {CustomUser, Project, ProjectRelations, Todo} from '../models';
import {CustomUserRepository} from './custom-user.repository';
import {TodoRepository} from './todo.repository';

export class ProjectRepository extends DefaultCrudRepository<
  Project,
  typeof Project.prototype.id,
  ProjectRelations
  > {

  public readonly customUser: BelongsToAccessor<CustomUser, typeof Project.prototype.id>;

  public readonly todos: HasManyRepositoryFactory<Todo, typeof Project.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('CustomUserRepository') protected customUserRepositoryGetter: Getter<CustomUserRepository>, @repository.getter('TodoRepository') protected todoRepositoryGetter: Getter<TodoRepository>,
  ) {
    super(Project, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor('todos', todoRepositoryGetter,);
    this.registerInclusionResolver('todos', this.todos.inclusionResolver);
    this.customUser = this.createBelongsToAccessorFor('customUser', customUserRepositoryGetter,);
    this.registerInclusionResolver('customUser', this.customUser.inclusionResolver);
  }
}
