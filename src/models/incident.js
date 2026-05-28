import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    category: {
      type: String,
      enum: [
        "VIOLENCE",
        "VOTE_BUYING",
        "INTIMIDATION",
        "RESULT_MANIPULATION",
      ],
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "RESOLVED"],
      default: "PENDING",
    },

    location: String,

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);