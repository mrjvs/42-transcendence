import { Body } from "@nestjs/common";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class UserEntity {
	
	@PrimaryColumn()
	id: number;

	@Column()
	name: string;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;
	
	@Column()
	intra_id: string;
}
