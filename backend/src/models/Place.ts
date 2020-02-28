import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { IsNotEmpty, IsLatitude, IsLongitude } from 'class-validator';

@Entity()
export default class Place {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  photoUri: string;

  @Column({ type: 'float' })
  @IsLatitude()
  latitude: number;

  @Column({ type: 'float' })
  @IsLongitude()
  longitude: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(name: string, latitude: number, longitude: number) {
    this.name = name;
    this.photoUri = '';
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
