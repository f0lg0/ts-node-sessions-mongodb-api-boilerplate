import mongoose from "mongoose";

interface IUser {
    username: string;
    password: string;
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model<IUser>("User", userSchema);

export { IUser, User };
