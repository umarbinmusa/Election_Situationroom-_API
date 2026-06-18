import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },

    full_name: {
      type: String,
      required: true,
    },

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
        "ICT_DIRECTOR",
        "LGA_ICT_DIRECTOR",
        "WARD_ICT_DIRECTOR",
        "POLLING_UNIT_OFFICER",
        "COORDINATOR",
        "OBSERVER",
        "SECURITY",
        "ANALYST",
        "MEDIA",
      ],
      default: "OBSERVER",
    },

    // Location hierarchy
    state: {
      type: String,
      default: null,
    },

    lga: {
      type: String,
      default: null,
    },

    ward: {
      type: String,
      default: null,
    },
    pollingUnit: {
  type: String,
  default: null,
},

    // Who created this account
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);