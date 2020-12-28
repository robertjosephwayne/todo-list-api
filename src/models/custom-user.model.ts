import {User} from '@loopback/authentication-jwt';
import {model} from '@loopback/repository';

@model()
export class CustomUser extends User {

  constructor(data?: Partial<CustomUser>) {
    super(data);
  }
}

export interface CustomUserRelations {
  // describe navigational properties here
}

export type CustomUserWithRelations = CustomUser & CustomUserRelations;
