import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        profilePicture: {
            type: String, // cloudinary URL
            required: false,
        },
        coverimage: {
            type: String, // cloudinary URL
            required: false,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        refreshToken: {
            type: String,
            required: false,
        },
    },
    {timestamps: true} // creates createdAt and updatedAt fields automatically
);
userSchema.pre('save', async function () {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {_Id: this._id, username: this.username, email: this.email},
        process.env.Access_Token_Secret,
        {expiresIn: process.env.Access_Token_Expiry}
    );
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {_Id: this._id},
        process.env.Refresh_Token_Secret,
        {expiresIn: process.env.Refresh_Token_Expiry}
    );
}

export const User = mongoose.model('User', userSchema);