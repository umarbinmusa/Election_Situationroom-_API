import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers/index.js';
import typeDefs from './graphql/schema/index.js';
import User from './models/user.js'; 
import Incident from './models/incident.js';
import PollingUnit from './models/pollingUnit.js';
import Result from './models/result.js';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors({ origin: '*' })); 

const ConnectDB = async (URI) => {
  if (!URI) {
    throw new Error("MongoDB URI is not defined. Please check the URI.");
  }

  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
const getUserFromToken = (token) => {
  try {
    if (!token) {
      console.log("No token provided.");
      return null;
    }

    const cleanToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    console.log("Decoding token:", cleanToken);

    if (!process.env.JWT_SECRET_KEY) {
      console.error("JWT_SECRET is not defined!");
      return null;
    }

    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET_KEY);
    console.log("Decoded User:", decoded);

    return decoded;
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
};




const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: false,
  context: ({ req }) => {
      // Ensure `user` is attached correctly
      const token = req.headers.authorization || "";
      const user = getUserFromToken(token); 
      console.log("Token received:", token);
     console.log("User decoded:", user);
// Ensure this function works
      
  
    
    return {
      models: {
  User, Incident, PollingUnit, Result,}, 
      user,
    };
  }
});



server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds
app.get('/', (req, res) => {
  res.redirect('/graphql'); 
});


// Apply Apollo Middleware after initialization
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  await ConnectDB(process.env.MONGODB_URI);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer();