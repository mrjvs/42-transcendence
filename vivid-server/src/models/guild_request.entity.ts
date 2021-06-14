import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Unique(['user', 'guild_anagram'])
@Entity({ name: 'guild_request' })
export class GuildRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user: string;

  @Column()
  invited_by: string;

  @Column()
  guild_anagram: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('boolean', { default: false })
  accepted: boolean;
}
