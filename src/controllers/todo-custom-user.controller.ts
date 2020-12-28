import {authenticate} from '@loopback/authentication';
import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Todo,
  CustomUser,
} from '../models';
import {TodoRepository} from '../repositories';

@authenticate('jwt')
export class TodoCustomUserController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
  ) { }

  @get('/todos/{id}/custom-user', {
    responses: {
      '200': {
        description: 'CustomUser belonging to Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CustomUser)},
          },
        },
      },
    },
  })
  async getCustomUser(
    @param.path.string('id') id: typeof Todo.prototype.id,
  ): Promise<CustomUser> {
    return this.todoRepository.customUser(id);
  }
}
