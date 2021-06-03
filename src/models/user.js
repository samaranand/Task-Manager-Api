const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email ID is not valid.");
            }
        }
    },
    age:{
        type: Number,
        validate(value){
            if(value<9){
                throw new Error("Invalid Age.");
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength:5,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Invalid Password...!')
            }
        }
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps:true
})

// generates what data needs to be send to frontend
userSchema.methods.getPublicData = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField:'_id',
    foreignField:'creater',
})


userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("Sorry, We doesn't recognize that email.")
    }
    const isMatched = await bcrypt.compare(password, user.password)

    if(!isMatched){
        throw new Error("Unable to login")
    }
    return user
}


// hash the plain text password
userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


// deletes the task when user is deleted
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({creater: user._id})
    next()
})

const User = mongoose.model('User',userSchema)


module.exports = User;