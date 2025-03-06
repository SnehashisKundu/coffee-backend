import mongoose,{Schema} from "mongoose";

const videoschema=new Schema(
    {
        videoFIles:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            required:true
        },
        ispublished:{
            type:Boolean,
            deafault:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
    },
    {
        timestamps:true
    }
)
export const Video =mongoose.model("Video",videoschema);
