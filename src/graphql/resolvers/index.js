import argon2 from "argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  AuthenticationError,
  ForbiddenError,
} from "apollo-server-express";

import User from "../../models/user.js";
import Incident from "../../models/incident.js";
import PollingUnit from "../../models/pollingUnit.js";
import Result from "../../models/result.js";



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

    // =========================
    // DASHBOARD STATS
    // =========================
    dashboardStats: async (_, __, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      const totalIncidents =
        await models.Incident.countDocuments();

      const pendingIncidents =
        await models.Incident.countDocuments({
          status: "PENDING",
        });

      const verifiedIncidents =
        await models.Incident.countDocuments({
          status: "VERIFIED",
        });

      const resolvedIncidents =
        await models.Incident.countDocuments({
          status: "RESOLVED",
        });

      return {
        totalIncidents,
        pendingIncidents,
        verifiedIncidents,
        resolvedIncidents,
      };
    },

    // =========================
    // GET POLLING UNITS
    // =========================
    getPollingUnits: async (_, __, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      return await models.PollingUnit.find();
    },

    // =========================
    // GET RESULTS
    // =========================
    getResults: async (_, __, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("Unauthorized");
      }

      return await models.Result.find().populate(
        "submittedBy"
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

      const hashedPassword =
        await argon2.hash(password);

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

      return {
        token,
        user,
      };
    },

    // =========================
    // LOGIN
    // =========================
    login: async (
      _,
      { username, password },
      { models }
    ) => {
      const user =
        await models.User.findOne({
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

      return {
        token,
        user,
      };
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

      return await models.Incident.create({
        title,
        description,
        category,
        location,
        reportedBy: user.id,
      });
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

    // =========================
    // CREATE POLLING UNIT
    // =========================
    createPollingUnit: async (
      _,
      { name, code, state, lga },
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

      return await models.PollingUnit.create({
        name,
        code,
        state,
        lga,
      });
    },

    // =========================
    // UPDATE POLLING UNIT STATUS
    // =========================
    updatePollingUnitStatus: async (
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

      return await models.PollingUnit.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
    },

    // =========================
    // SUBMIT RESULT
    // =========================
    submitResult: async (
  _,
  { pollingUnit, candidate, votes },
  { models, user }
) => {
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const result = await models.Result.create({
  pollingUnit,
  candidate,
  votes,
  submittedBy: user.id,
});

return await models.Result.findById(result._id)
  .populate("submittedBy");
    },
  },
};

export default resolvers;