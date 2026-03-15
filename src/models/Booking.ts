import mongoose,{Document,Schema} from "mongoose";

export interface IBooking extends Document{
    UserId :mongoose.Types.ObjectId;
    firstName:string;
    lastName:string;
    phone:string;
    service:string;
    date:Date;
    notes?:string;
    status:string;
    createdAt:Date;
}
const bookingSchema:Schema= new Schema<IBooking>({
    UserId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    firstName:{type:String,required:true},
    lastName:{type:String,required:true},
    phone:{type:String,required:true},
    service:{type:String,required:true},
    date:{type:Date,required:true},
    notes:{type:String},
    status:{type:String,emun:["Pending,Cancelled,Completed,Deleted"],default:"Pending"},
},{timestamps:true});

const Booking = mongoose.models.Booking || mongoose.model("Booking",bookingSchema);
export default Booking
