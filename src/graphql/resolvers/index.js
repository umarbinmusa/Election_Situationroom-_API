import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  AuthenticationError,
  ForbiddenError,
} from "apollo-server-express";

import User from "../../models/user.js";
import Incident from "../../models/incident.js";

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const resolvers = {
  Query: {
    // =========================
    // GET ALL USERS
    // =========================
    getUsers: async (_, __, { models, user }) => {
      if (!user || user.role !== "ADMIN") {
        throw new ForbiddenError(
          "Access denied. Admins only."
        );
      }

      return await models.User.find();
    },

    // =========================
    // GET ALL INCIDENTS
    // =========================
    getIncidents: async (_, __, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      return await models.Incident.find().populate(
        "reportedBy"
      );
    },

    // =========================
    // GET SINGLE INCIDENT
    // =========================
    getIncident: async (_, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      return await models.Incident.findById(id).populate(
        "reportedBy"
      );
    },
  },

  Mutation: {
    // =========================
    // SIGNUP
    // =========================
    signup: async (
      _,
      { username, password, role, email, full_name },
      { models }
    ) => {
      if (!username || !password || !role) {
        throw new AuthenticationError(
          "All fields are required"
        );
      }

      const existingUser =
        await models.User.findOne({
          username,
        });

      if (existingUser) {
        throw new AuthenticationError(
          "Username already taken"
        );
      }

      const hashedPassword = await argon2.hash(
        password
      );

      const user = await models.User.create({
        username,
        email,
        full_name,
        password: hashedPassword,
        role,
      });

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      return { token, user };
    },

    // =========================
    // LOGIN
    // =========================
    login: async (
      _,
      { username, password },
      { models }
    ) => {
      const user = await models.User.findOne({
        username,
      });

      if (
        !user ||
        !(await argon2.verify(
          user.password,
          password
        ))
      ) {
        throw new AuthenticationError(
          "Invalid credentials"
        );
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      return { token, user };
    },

    // =========================
    // CREATE INCIDENT
    // =========================
    createIncident: async (
      _,
      {
        title,
        description,
        category,
        location,
      },
      { models, user }
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "Unauthorized"
        );
      }

      const incident =
        await models.Incident.create({
          title,
          description,
          category,
          location,
          reportedBy: user.id,
        });

      return incident;
    },

    // =========================
    // UPDATE INCIDENT STATUS
    // =========================
    updateIncidentStatus: async (
      _,
      { id, status },
      { models, user }
    ) => {
      if (
        !user ||
        (user.role !== "ADMIN" &&
          user.role !== "COORDINATOR")
      ) {
        throw new ForbiddenError(
          "Access denied"
        );
      }

      return await models.Incident.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    },

    // =========================
    // DELETE INCIDENT
    // =========================
    deleteIncident: async (
      _,
      { id },
      { models, user }
    ) => {
      if (!user || user.role !== "ADMIN") {
        throw new ForbiddenError(
          "Admins only"
        );
      }

      await models.Incident.findByIdAndDelete(id);

      return "Incident deleted successfully";
    },
  },
};

export default resolvers;