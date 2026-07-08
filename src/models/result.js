import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    pollingUnit: {
      type: String,
      required: true,
    },

    electionType: {
      type: String,
      required: true,
      enum: [
        "PRESIDENTIAL",
        "GOVERNORSHIP",
        "SENATORIAL",
        "HOUSE_OF_REPS",
        "STATE_ASSEMBLY",
      ],
    },

    candidate: {
      type: String,
      required: true,
      enum: [
        "APC",
        "PDP",
        "LP",
        "NNPP",
        "SDP",
        "ADC",
        "YPP",
        "AAC",
        "APGA",
      ],
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