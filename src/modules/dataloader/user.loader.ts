import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { User } from '../users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // ─── Batch load users by ID ────────────────────────────────────────────────

  readonly byId = new DataLoader<string, User | null>(
    async (ids: readonly string[]) => {
      const users = await this.userRepo.find({
        where: { id: In([...ids]) },
      });
      const map = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => map.get(id) ?? null);
    },
    { cache: true },
  );

  // ─── Batch load users by email ─────────────────────────────────────────────

  readonly byEmail = new DataLoader<string, User | null>(
    async (emails: readonly string[]) => {
      const users = await this.userRepo.find({
        where: { email: In([...emails]) },
      });
      const map = new Map(users.map((u) => [u.email, u]));
      return emails.map((email) => map.get(email) ?? null);
    },
    { cache: true },
  );
}