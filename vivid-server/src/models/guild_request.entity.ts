import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Unique(['user', 'guild_anagram'])
@Entity({ name: 'guildRequest' })
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
  createdAt: Date;

  @Column('boolean', { default: false })
  accepted: boolean;
}
