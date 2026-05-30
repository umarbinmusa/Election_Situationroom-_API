import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    pollingUnit: {
      type: String,
      required: true,
    },

    candidate: {
      type: String,
      required: true,
    },

    votes: {
      type: Number,
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);