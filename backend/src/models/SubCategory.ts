import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import Category from './Category';
import Income from './Income';
import Expense from './Expense';

@Entity()
export default class SubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsNotEmpty()
  name: string;

  @ManyToOne(
    () => Category,
    (category) => category.subCategories,
    { onDelete: 'CASCADE' },
  )
  category: Category;

  @OneToMany(
    () => Income,
    (income) => income.subCategory,
  )
  incomes!: Income[];

  @OneToMany(
    () => Expense,
    (expense) => expense.subCategory,
  )
  expenses!: Expense[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(name: string, category: Category) {
    this.name = name;
    this.category = category;
  }
}
