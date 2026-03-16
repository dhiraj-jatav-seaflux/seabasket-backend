import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductsEntity } from "./products.entity";
import { UserEntity } from "./user.entity";

@Entity("reviews")
export class ReviewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  userId: number;

  @Column({ type: "int", nullable: false })
  productId: number;

  @Column({ type: "int", nullable: false })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(
    () => UserEntity,
    user => user.reviews,
  )
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @ManyToOne(
    () => ProductsEntity,
    product => product.reviews,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "productId" })
  product: ProductsEntity;
}
