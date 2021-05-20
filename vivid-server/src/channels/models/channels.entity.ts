import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ChannelEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
