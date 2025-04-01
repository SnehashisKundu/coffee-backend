import { subscribe } from "diagnostics_channel";
import mongoose,{Schema} from "mongoose";

const subscriptionSchema= new Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }                                               
    }
)

export const Subsciption=mongoose.model("Subscription",subscriptionSchema)