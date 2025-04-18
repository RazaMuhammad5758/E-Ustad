const { Schema, model } = require('mongoose')
const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require('../services/authentication');

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
        default: "/images/profile.jpg"
    },
    salt:{
        type: String,
        
    },
    password:{
        type: String,
        required: true,  
    },
    phone:{
        type: Number,
        required: true,  
    },
    address: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['CLIENT', 'PROFESSIONAL'],
        default: 'CLIENT'
    },
}, 
{timestamps: true})

userSchema.pre("save",  function(next){
    const user = this;

    if(!this.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256", salt).update(user.password).digest('hex');
    this.salt = salt;
    this.password = hashedPassword

    next();
})

userSchema.static("matchPasswordAndGenerateToken", async function(email, password){
    const user = await this.findOne({email})
    if(!user) throw new Error("User not found");

    const salt = user.salt
    const hashedPassword = user.password

    const userProvidedHashed = createHmac("sha256", salt).update(password).digest('hex');
    
    if(hashedPassword !== userProvidedHashed) throw new Error("Password Incorrect");
    
    const token = createTokenForUser(user)
    return token;

})

const User = model('user', userSchema);

module.exports = User;