import {User} from '@loopback/authentication-jwt';
import {hasMany, model, property} from '@loopback/repository';
import {Todo} from './todo.model';

@model()
export class CustomUser extends User {
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4',
  })
  id: string;

  @hasMany(() => Todo)
  todos: Todo[];

  constructor(data?: Partial<CustomUser>) {
    super(data);
  }
}

export interface CustomUserRelations {
  // describe navigational properties here
}

export type CustomUserWithRelations = CustomUser & CustomUserRelations;
