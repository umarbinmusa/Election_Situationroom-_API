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
 getStateUsers: async (_, __, { models }) => {
  return await models.User.find({
    role: "ICT_DIRECTOR"
  });
},

getLGAUsers: async (_, __, { models }) => {
  return await models.User.find({
    role: "LGA_ICT_DIRECTOR"
  });
},
getWardUsers: async (
  _,
  __,
  { models, user }
) => {
  if (!user) {
    throw new ForbiddenError("Access denied");
  }

  return await models.User.find({
    role: "WARD_ICT_DIRECTOR",
    state: user.state,
    lga: user.lga
  });
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
    candidateResults: async (_, __, { models, user }) => {
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const results = await models.Result.aggregate([
    {
      $group: {
        _id: "$candidate",
        totalVotes: { $sum: "$votes" },
      },
    },
    {
      $sort: {
        totalVotes: -1,
      },
    },
  ]);

  return results.map((r) => ({
    candidate: r._id,
    totalVotes: r.totalVotes,
  }));
},
getPollingUnitUsers: async (
  _,
  __,
  { models, user }
) => {
  if (
    !user ||
    user.role !== "WARD_ICT_DIRECTOR"
  ) {
    throw new ForbiddenError(
      "Access denied"
    );
  }

  return await models.User.find({
    role: "POLLING_UNIT_OFFICER",
    state: user.state,
    lga: user.lga,
    ward: user.ward,
  });
},
electionSummary: async (_, __, { models, user }) => {
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const results = await models.Result.aggregate([
    {
      $group: {
        _id: "$candidate",
        totalVotes: { $sum: "$votes" }
      }
    },
    {
      $sort: {
        totalVotes: -1
      }
    }
  ]);

  const winner =
    results.length > 0 ? results[0]._id : null;

  const winnerVotes =
    results.length > 0 ? results[0].totalVotes : 0;

  return {
    winner,
    totalVotes: winnerVotes,
    results: results.map((r) => ({
      candidate: r._id,
      totalVotes: r.totalVotes
    }))
  };
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
    createICTDirector: async (
  _,
  {
    username,
    password,
    email,
    full_name,
    state,
  },
  { models, user }
) => {
  if (!user || user.role !== "ADMIN") {
    throw new ForbiddenError(
      "Only Admin can create ICT Directors"
    );
  }

  const hashedPassword =
    await argon2.hash(password);

  return await models.User.create({
    username,
    email,
    full_name,
    password: hashedPassword,
    role: "ICT_DIRECTOR",
    state,
    createdBy: user.id,
  });
},

createLGADirector: async (
  _,
  {
    username,
    password,
    email,
    full_name,
    lga,
  },
  { models, user }
) => {
  console.log("AUTH USER:", user);

  if (!user || user.role !== "ICT_DIRECTOR") {
    throw new ForbiddenError(
      "Only ICT Directors can create LGA Directors"
    );
  }

  // Get fresh ICT Director data from database
  const currentUser = await models.User.findById(user.id);

  console.log("CURRENT USER FROM DB:", currentUser);

  if (!currentUser) {
    throw new Error("ICT Director account not found");
  }

  if (!currentUser.state) {
    throw new Error(
      "ICT Director has no state assigned"
    );
  }

  // Check username uniqueness
  const existingUser =
    await models.User.findOne({ username });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const hashedPassword =
    await argon2.hash(password);

  // Create LGA Director
  const lgaDirector =
    await models.User.create({
      username,
      email,
      full_name,
      password: hashedPassword,

      role: "LGA_ICT_DIRECTOR",

      state: currentUser.state,
      lga,

      createdBy: currentUser._id,
    });

  console.log(
    "CREATED LGA DIRECTOR:",
    lgaDirector
  );

  return lgaDirector;
},

createWardDirector: async (
  _,
  {
    username,
    password,
    email,
    full_name,
    ward,
  },
  { models, user }
) => {
  if (
    !user ||
    user.role !== "LGA_ICT_DIRECTOR"
  ) {
    throw new ForbiddenError(
      "Only LGA Directors can create Ward Directors"
    );
  }

  const hashedPassword =
    await argon2.hash(password);

  return await models.User.create({
    username,
    email,
    full_name,
    password: hashedPassword,

    role: "WARD_ICT_DIRECTOR",

    state: user.state,
    lga: user.lga,
    ward,

    createdBy: user.id,
  });
},
createPollingUnitOfficer: async (
  _,
  args,
  { models, user }
) => {
  try {
    console.log("Logged in user:", user);

    const currentUser = await models.User.findById(user.id);
    console.log("Current user from DB:", currentUser);

    const hashedPassword = await argon2.hash(args.password);

    const officer = await models.User.create({
      username: args.username,
      full_name: args.full_name,
      email: args.email,
      password: hashedPassword,
      role: "POLLING_UNIT_OFFICER",
      state: currentUser.state,
      lga: currentUser.lga,
      ward: currentUser.ward,
      pollingUnit: args.pollingUnit,
      createdBy: currentUser._id,
    });

    console.log("Created officer:", officer);

    return officer;
  } catch (error) {
    console.error(error);
    throw error;
  }
},    // =========================
    // SUBMIT RESULT
    // =========================
 submitResult: async (
  _,
  { pollingUnit, electionType, candidate, votes },
  { models, user }
) => {
  if (!user) {
    throw new AuthenticationError("Unauthorized");
  }

  const result = await models.Result.create({
    pollingUnit,
    electionType,
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