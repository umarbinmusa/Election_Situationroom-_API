import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },

    full_name: String,

    email: {
      type: String,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "ADMIN",
        "COORDINATOR",
        "OBSERVER",
        "SECURITY",
        "ANALYST",
        "MEDIA",
      ],
      default: "OBSERVER",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);