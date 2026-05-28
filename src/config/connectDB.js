import mongoose from "mongoose";

const ConnectDB = async (URI) => {
  if (!URI) {
    throw new Error("MongoDB URI is not defined. Please check the URI.");
  }

  try {
    // Try to connect to MongoDB using the URI
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};

export default ConnectDB;
