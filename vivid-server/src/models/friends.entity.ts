import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'friends' })
export class FriendsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  id_request: string;

  @Column()
  id_accept: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('boolean', { default: false })
  Accepted: boolean;
}
