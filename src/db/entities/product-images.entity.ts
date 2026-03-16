import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ProductsEntity } from "./products.entity";

@Entity("product_images")
export class ProductImagesEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:"int", nullable:false})
    productId:number;

    @Column({type:"varchar", length:250})
    imageUrl:string;

    @Column({type:'varchar', length:255})
    publicId:string;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @ManyToOne(()=>ProductsEntity, (product)=>product.images,{onDelete:'CASCADE'})
    @JoinColumn({name:"product_id"})
    product:ProductsEntity;
}