import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ProductsEntity } from "./products.entity";

@Entity("categories")
export class CategoriesEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:"varchar", length:50, nullable:false, unique:true})
    categoryName:string

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProductsEntity, (product) => product.category)
    products: ProductsEntity[];
}