import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Project} from './project.model';


@model()
export class Todo extends Entity {
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
  title: string;

  @property({
    type: 'boolean',
    required: true,
  })
  isComplete: boolean;

  @property({
    type: 'date',
    default: () => new Date()
  })
  createdAt?: Date;

  @belongsTo(() => Project)
  projectId: string;

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  // describe navigational properties here
}

export type TodoWithRelations = Todo & TodoRelations;
