const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // validation
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        } // custom validator
    },
    //for logging out
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        // allow us to store the buffer with our binary image data right in the DB 
        // alongside with user that the image belongs to.
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// for removing un-needed data that send back to user (e.g. password)
// userSchema.methods.getPublicProfile = funct... // for option 1
// below as for option 2 
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


// methods are accessible on instances (instance method)
userSchema.methods.generateAuthToken = async function () {
    const user = this // not necessary
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token: token })
    await user.save()

    return token

}

// statics code are accessible on model (model methods)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    // or post()
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema) // let us take advantage to use middleware

module.exports = User