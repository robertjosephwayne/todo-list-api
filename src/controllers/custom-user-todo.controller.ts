import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {
  CustomUser,
  Todo
} from '../models';
import {CustomUserRepository} from '../repositories';

// @authenticate('jwt')
export class CustomUserTodoController {
  constructor(
    @repository(CustomUserRepository) protected customUserRepository: CustomUserRepository,
  ) { }

  @get('/custom-users/{id}/todos', {
    responses: {
      '200': {
        description: 'Array of CustomUser has many Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    // if (currentUserProfile[securityId] !== id) return [];

    return this.customUserRepository.todos(id).find(filter);
  }

  @post('/custom-users/{id}/todos', {
    responses: {
      '200': {
        description: 'CustomUser model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof CustomUser.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodoInCustomUser',
            exclude: ['id'],
            optional: ['customUserId']
          }),
        },
      },
    }) todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.customUserRepository.todos(id).create(todo);
  }

  @patch('/custom-users/{id}/todos', {
    responses: {
      '200': {
        description: 'CustomUser.Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.customUserRepository.todos(id).patch(todo, where);
  }

  @del('/custom-users/{id}/todos', {
    responses: {
      '200': {
        description: 'CustomUser.Todo DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.customUserRepository.todos(id).delete(where);
  }
}
