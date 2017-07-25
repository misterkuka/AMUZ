const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
name:{
      type: String,
      required:true
},
username:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    // unique:true
},
password:{
    type:String,
    required:true
},

about: {
  type:String,
},

instrument:{
  type:String,
},

education:[{
        school:{
          type:String
        },
        completed:{
          type:String
        }
}]
});

const User = module.exports = mongoose.model('User', UserSchema);
