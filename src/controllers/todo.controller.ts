import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param,
  patch, post,
  put,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Todo} from '../models';
import {TodoRepository} from '../repositories';

// TODO: Finish implementing authorization for routes
@authenticate('jwt')
export class TodoController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
  ) { }

  @post('/todos', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodo',
            exclude: ['id'],
          }),
        },
      },
    })
    todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todoRepository.create(todo);
  }

  @get('/todos/count', {
    responses: {
      '200': {
        description: 'Todo model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.where(Todo) where?: Where<Todo>,
  ): Promise<Count> {
    // const updatedWhere = {
    //   ...where,
    //   customUserId: currentUserProfile[securityId]
    // };
    return this.todoRepository.count(where);
  }

  @get('/todos', {
    responses: {
      '200': {
        description: 'Array of Todo model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Todo, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(Todo) filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    // const updatedFilter = {
    //   ...filter,
    //   where: {
    //     ...filter?.where,
    //     customUserId: currentUserProfile[securityId]
    //   }
    // }
    return this.todoRepository.find(filter);
  }

  @patch('/todos', {
    responses: {
      '200': {
        description: 'Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Todo,
    @param.where(Todo) where?: Where<Todo>,
  ): Promise<Count> {
    // const updatedWhere = {
    //   ...where,
    //   customUserId: currentUserProfile[securityId]
    // };
    return this.todoRepository.updateAll(todo, where);
  }

  @get('/todos/{id}', {
    responses: {
      '200': {
        description: 'Todo model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Todo, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Todo, {exclude: 'where'}) filter?: FilterExcludingWhere<Todo>
  ): Promise<Todo | void> {
    const owner = await this.getCustomUserId(id);
    if (owner !== currentUserProfile[securityId]) return;
    return this.todoRepository.findById(id, filter);
  }

  @patch('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PATCH success',
      },
    },
  })
  async updateById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Todo,
  ): Promise<Todo | void> {
    const owner = await this.getCustomUserId(id);
    // TODO: Review what should be returned for unauthorized requests
    if (owner !== currentUserProfile[securityId]) return;
    await this.todoRepository.updateById(id, todo);
  }

  @put('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo PUT success',
      },
    },
  })
  async replaceById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody() todo: Todo,
  ): Promise<void> {
    // const currentTodo = await this.todoRepository.findById(id);
    // if (currentUserProfile[securityId] !== currentTodo.customUserId) return;
    await this.todoRepository.replaceById(id, todo);
  }

  @del('/todos/{id}', {
    responses: {
      '204': {
        description: 'Todo DELETE success',
      },
    },
  })
  async deleteById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string
  ): Promise<void> {
    const owner = await this.getCustomUserId(id);
    // TODO: Review what should be returned for unauthorized requests
    if (owner !== currentUserProfile[securityId]) return;
    await this.todoRepository.deleteById(id,);
  }

  private async getProject(
    id: typeof Todo.prototype.id
  ): Promise<Project> {
    return this.todoRepository.project(id);
  }

  private async getCustomUserId(
    id: typeof Todo.prototype.id
  ): Promise<typeof CustomUser.prototype.id> {
    const project = await this.getProject(id);
    return project.customUserId;
  }
}
