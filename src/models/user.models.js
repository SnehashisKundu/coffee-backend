import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userschema=new Schema({
    username:{
        type:String,
        requiered:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        requiered:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    fullname:{
        type:String,
        requiered:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,//cloudinary url
    },
    coverImage:{
        type:String
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    password:{
        type:String,
        required:[true,"Password is required."]
    },
    refreshtoken:{
        type:String
    }
},
{
    timestamps:true
})

userschema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); 
    this.password = await bcrypt.hash(this.password, 10);
    next();
});



userschema.methods.isPasswordCorrect = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;

    // console.log("Entered Password:", enteredPassword);
    // console.log("Stored Hashed Password:", this.password);
    //console.log("Comparison Result:", isMatch);
};

userschema.methods.generateAccessToken=function() {//token generating
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userschema.methods.generateRefreshToken=async function() {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
export const User =mongoose.model("User",userschema);