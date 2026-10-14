import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmailForAuth(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  create(email: string, senhaHash: string) {
    return this.usersRepository.create(email, senhaHash);
  }
}
