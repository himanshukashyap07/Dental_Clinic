import mongoose, { Document,Schema } from "mongoose";


export interface IUser extends Document{
    username:string;
    email:string;
    role:string;
    password:string;
}

const userSchema = new Schema<IUser>({
    username:{
        type:String,
        required:[true,"Username is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        toLowerCase:true,
        min:5,
        trim:true,
        index:true
    },
    role:{
        type:String,
        enum:["User","Admin","Guest"],
        default:"Guest"
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    }

},{timestamps:true})

const User = mongoose.models.User ||mongoose.model("User",userSchema)

export default User