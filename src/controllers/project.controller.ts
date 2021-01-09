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
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Project} from '../models';
import {ProjectRepository} from '../repositories';

@authenticate('jwt')
export class ProjectController {
  constructor(
    @repository(ProjectRepository)
    public projectRepository: ProjectRepository,
  ) { }

  @post('/projects', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {'application/json': {schema: getModelSchemaRef(Project)}},
      },
    },
  })
  async create(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {
            title: 'NewProject',
            exclude: ['id', 'customUserId'],
          }),
        },
      },
    })
    project: Omit<Project, 'id'>,
  ): Promise<Project> {
    project.customUserId = currentUserProfile[securityId];
    return this.projectRepository.create(project);
  }

  @get('/projects/count', {
    responses: {
      '200': {
        description: 'Project model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.where(Project) where?: Where<Project>,
  ): Promise<Count> {
    const updatedWhere = {
      ...where,
      customUserId: currentUserProfile[securityId]
    };
    return this.projectRepository.count(updatedWhere);
  }

  @get('/projects', {
    responses: {
      '200': {
        description: 'Array of Project model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Project, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.filter(Project) filter?: Filter<Project>,
  ): Promise<Project[]> {
    const updatedFilter = {
      ...filter,
      where: {
        ...filter?.where,
        customUserId: currentUserProfile[securityId]
      }
    };
    return this.projectRepository.find(updatedFilter);
  }

  @patch('/projects', {
    responses: {
      '200': {
        description: 'Project PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {partial: true}),
        },
      },
    })
    project: Project,
    @param.where(Project) where?: Where<Project>,
  ): Promise<Count> {
    const updatedWhere = {
      ...where,
      customUserId: currentUserProfile[securityId]
    };
    return this.projectRepository.updateAll(project, updatedWhere);
  }

  @get('/projects/{id}', {
    responses: {
      '200': {
        description: 'Project model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Project, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @param.filter(Project, {exclude: 'where'}) filter?: FilterExcludingWhere<Project>
  ): Promise<Project> {
    const updatedFilter = {
      ...filter,
      where: {
        customUserId: currentUserProfile[securityId]
      }
    }
    return this.projectRepository.findById(id, updatedFilter);
  }

  @patch('/projects/{id}', {
    responses: {
      '204': {
        description: 'Project PATCH success',
      },
    },
  })
  async updateById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Project, {partial: true}),
        },
      },
    })
    project: Project,
  ): Promise<void> {
    const currentProject = await this.projectRepository.findById(id);
    if (currentUserProfile[securityId] !== currentProject.customUserId) return;
    await this.projectRepository.updateById(id, project);
  }

  @put('/projects/{id}', {
    responses: {
      '204': {
        description: 'Project PUT success',
      },
    },
  })
  async replaceById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
    @requestBody() project: Project,
  ): Promise<void> {
    const currentProject = await this.projectRepository.findById(id);
    if (currentUserProfile[securityId] !== currentProject.customUserId) return;
    await this.projectRepository.replaceById(id, project);
  }

  @del('/projects/{id}', {
    responses: {
      '204': {
        description: 'Project DELETE success',
      },
    },
  })
  async deleteById(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    @param.path.string('id') id: string
  ): Promise<void> {
    const currentProject = await this.projectRepository.findById(id);
    if (currentUserProfile[securityId] !== currentProject.customUserId) return;
    await this.projectRepository.deleteById(id);
  }
}
