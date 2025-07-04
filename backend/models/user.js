const mongoose=require('mongoose')
const user=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
         type:String,
        required:true
    },
     password:{
         type:String,
        required:true
    },
     
     role:{
         type:String,
        enum:['admin','customer'],
        default:'customer'
    }
})
module.exports=mongoose.model("User",user)