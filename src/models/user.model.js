import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
    },
    age: {
        type: Number,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    profileImage: {
        type: String,
        default: "",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    bio: {
        type: String,
        default: "",
    },
    address: {
        country: String,
        city: String,
    },
    profession: {
        type: String
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastLogin: Date,
    refreshToken: {
        type: String,
        default: "",
    },
    socialLinks: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        portfolio: { type: String, default: "" },
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;

        return ret;
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
};

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshToken;
    return user;
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};
userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export const User = mongoose.model("Users", userSchema);