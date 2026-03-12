import { UserRole } from "@types";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReviewsEntity } from "./reviews.entity";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  firstName: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  lastName: string;

  @Column({type:"varchar", length:100, nullable:false, unique:true})
  email:string

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({type:"varchar", length:15, nullable:false})
  phone:string

  @Column({type:"enum", enum:UserRole, default:UserRole.USER})
  role:UserRole

  @Column({type:"text", nullable:false})
  address:string

  @Column({type:"varchar", length:100, nullable:false})
  city:string

  @Column({type:"varchar", length:6, nullable:false})
  pincode:string

  @Column({type:"varchar", length:100, nullable:false})
  state:string

  @Column({type:"varchar", length:6})
  loginOtp:string

  @Column({type:"timestamp"})
  loginOtpExpiration:Date;

  @Column({type:"varchar", length:255})
  resetToken:string

  @Column({type:"timestamp"})
  resetTokenExpiration:Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReviewsEntity, (review) => review.user)
  reviews: ReviewsEntity[];
}