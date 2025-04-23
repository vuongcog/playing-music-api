import { User } from './user.entity';
import { IsEmpty } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  IsNull,
  ManyToMany,
} from 'typeorm';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  title: string;

  @Column({ nullable: true })
  artist: string;

  @Column({ nullable: true })
  album: string;

  @Column({ nullable: true })
  genre: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  fileUrl: string;

  @Column()
  imageUrl: string;

  @ManyToMany(() => User, (user) => user.likedTracks)
  usersWhoLiked: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
