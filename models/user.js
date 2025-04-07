const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    fullName:{
        type: String,
        required: true,

    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    profileImageUrl:{
        type: String,
        default: "./images/profile.svg"
    },
    salt:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,  
    },
    role:{
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
}, 
{timestamps: true})

const User = model('user', userSchema);

module.exports = User;