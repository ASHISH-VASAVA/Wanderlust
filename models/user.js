const mongoose=require('mongoose');
const Schmea=mongoose.Schema;
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new Schmea({
    email: {type:String,required:true},
   
});

userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);