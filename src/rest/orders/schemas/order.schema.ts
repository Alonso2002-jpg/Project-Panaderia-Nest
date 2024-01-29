import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoosePaginate from 'mongoose-paginate-v2'
export class Address {
    @Prop({ type: String, required: true, length: 100, default: '' })
    street: string;

    @Prop({ type: String, required: true, length: 50, default: '' })
    number: string;

    @Prop({ type: String, required: true, length: 100, default: '' })
    city: string;

    @Prop({ type: String, required: true, length: 100, default: ''})
    province: string;

    @Prop({ type: String, required: true, length: 100, default: ''})
    country: string;

    @Prop({ type: String, required: true, length: 100, default: ''})
    postCode: string;
}

export class Client {
    @Prop({ type: String, required: true, length: 100, default: '' })
    fullName: string;

    @Prop({ type: String, required: true, length: 100, default: ''})
    email: string;

    @Prop({ type: String, required: true, length: 100, default: '' })
    telephone: string;

    @Prop({ required: true, })
    address: Address;
}

export class OrderLine {
    @Prop({ type: Number, required: true })
    idProduct: number;

    @Prop({ type: Number, required: true})
    priceProduct: number;

    @Prop({ type: Number, required: true })
    stock: number;

    @Prop({ type: Number, required: true})
    total: number;
}

export type OrderDocument = Order & Document
@Schema({ collection: 'order', timestamps: false, versionKey: false, id: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v
            ret.id = ret._id
            delete ret._id
            delete ret._class
        },
    },
})

export class Order {
    @Prop({ type: Number, required: true })
    idUser: number;

    @Prop({ required: true })
    client: Client;

    @Prop({ required: true })
    orderLine: OrderLine[];

    @Prop()
    totalItems: number;

    @Prop()
    total: number;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;

    @Prop({ default: false })
    isDeleted: boolean;
}
export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.plugin(mongoosePaginate)
