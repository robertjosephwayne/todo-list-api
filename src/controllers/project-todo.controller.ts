import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { Count, CountSchema, Filter, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, getWhereSchemaFor, param, patch, post, requestBody } from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';

import { Project, Todo } from '../models';
import { ProjectRepository } from '../repositories';

// TODO: Finish implementing authorization for routes
@authenticate('jwt')
export class ProjectTodoController {
  constructor(
    @repository(ProjectRepository) protected projectRepository: ProjectRepository,
  ) { }

  @get('/projects/{id}/todos', {
    responses: {
      '200': {
        description: 'Array of Project has many Todo',
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
    const userId = await this.projectRepository.customUser(id).then(customUser => customUser.id);
    if (userId !== currentUserProfile[securityId]) return [];
    return this.projectRepository.todos(id).find(filter);
  }

  @post('/projects/{id}/todos', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: typeof Project.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodoInProject',
            exclude: ['id'],
            optional: ['projectId']
          }),
        },
      },
    }) todo: Omit<Todo, 'id'>,
  ): Promise<Todo | {}> {
    const userId = await this.projectRepository.customUser(id).then(customUser => customUser.id);
    // TODO: Review what should be returned for unauthorized requests
    if (userId !== currentUserProfile[securityId]) return {};
    return this.projectRepository.todos(id).create(todo);
  }

  @patch('/projects/{id}/todos/{todoId}', {
    responses: {
      '200': {
        description: 'Project.Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.path.string('todoId') todoId: string,
    @requestBody() todo: Partial<Todo>,
  ): Promise<Count> {
    const userId = await this.projectRepository.customUser(id).then(customUser => customUser.id);
    // TODO: Review what should be returned for unauthorized requests
    if (userId !== currentUserProfile[securityId]) return {count: 0};
    return this.projectRepository.todos(id).patch(todo, {id: todoId});
  }

  @del('/projects/{id}/todos', {
    responses: {
      '200': {
        description: 'Project.Todo DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count | void> {
    const userId = await this.projectRepository.customUser(id).then(customUser => customUser.id);
    // TODO: Review what should be returned for unauthorized requests
    if (userId !== currentUserProfile[securityId]) return;
    return this.projectRepository.todos(id).delete(where);
  }
}
