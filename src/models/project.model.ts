import { belongsTo, Entity, hasMany, model, property } from '@loopback/repository';

import { CustomUser } from './custom-user.model';
import { Todo } from './todo.model';

@model()
export class Project extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @belongsTo(() => CustomUser)
  customUserId: string;

  @hasMany(() => Todo)
  todos: Todo[];

  constructor(data?: Partial<Project>) {
    super(data);
  }
}

export interface ProjectRelations {
  // describe navigational properties here
}

export type ProjectWithRelations = Project & ProjectRelations;
