import mongoose, { Document, Schema } from 'mongoose';

export interface AmountPaid extends Document {
    amount: number;
    paymentMethod: string;
    date: Date;
}
export interface Treatment extends Document {
    treatmentName: string;
    description: string;   
    date: Date;
}

export interface IPaymentDetails extends Document {
    username: string;
    mobileNumber: number;
    amountPaid: AmountPaid[];
    totalAmount: number;
    treatements: Treatment[];
    paymentMethod: string;
    paymentStatus: string;
    createdAt: Date;
    updatedAt: Date;
}


const AmountPaidSchema: Schema = new Schema<AmountPaid>({
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum:["Online","Cash"] },
    date: { type: Date,default: Date.now }
});

const TreatmentSchema: Schema = new Schema<Treatment>({
    treatmentName: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
});


const paymentDetailsSchema: Schema = new Schema<IPaymentDetails>({
    username: { type: String, required: true },
    mobileNumber: { type: Number, required: true,unique: true,trim: true},
    amountPaid: { type: [AmountPaidSchema], required: true },
    totalAmount: { type: Number, required: true },
    treatements: { type: [TreatmentSchema], required: true },
    paymentMethod: { type: String, enum:["Online","Cash"] },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
}, {
    timestamps: true
});

const PaymentDetails = mongoose.models.PaymentDetails || mongoose.model<IPaymentDetails>('PaymentDetails', paymentDetailsSchema);
export default PaymentDetails;