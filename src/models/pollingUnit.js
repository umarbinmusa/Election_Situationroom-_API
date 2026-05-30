// pollingUnit.js
import mongoose from "mongoose";

const pollingUnitSchema = new mongoose.Schema({
  name: String,
  code: String,
  state: String,
  lga: String,
  status: {
    type: String,
    default: "OPEN",
  },
});

export default mongoose.model(
  "PollingUnit",
  pollingUnitSchema
);