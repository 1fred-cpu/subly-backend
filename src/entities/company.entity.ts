import { PrimaryGeneratedColumn, Column, Entity, Index } from 'typeorm';

@Index(['name'])
@Entity('companies')
export class Company {}
