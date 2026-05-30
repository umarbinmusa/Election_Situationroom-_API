import { gql } from "apollo-server-express";

export default gql`
  schema {
    query: Query
    mutation: Mutation
  }
type User {
  id: ID!
  username: String!
  email: String
  full_name: String
  role: String!
}

 type Incident {
    id: ID!
    title: String!
    description: String!
    category: String!
    status: String!
    location: String!
    reportedBy: User
  }
type DashboardStats {
  totalIncidents: Int!
  pendingIncidents: Int!
  verifiedIncidents: Int!
  resolvedIncidents: Int!
}

type PollingUnit {
  id: ID!
  name: String!
  code: String!
  state: String!
  lga: String!
  status: String!
}

type Result {
  id: ID!
  pollingUnit: String!
  candidate: String!
  votes: Int!
  submittedBy: User
}

type AuthPayload {
  token: String!
  user: User!
}
type Query {
  getUsers: [User]
  getIncidents: [Incident]
  getIncident(id: ID!): Incident
  dashboardStats: DashboardStats
  getPollingUnits: [PollingUnit]
  getResults: [Result]
  
}

type Mutation {
  signup(
    username: String!
    password: String!
    role: String!
    email: String
    full_name: String
  ): AuthPayload

  login(
    username: String!
    password: String!
  ): AuthPayload

   createIncident(
      title: String!
      description: String!
      category: String!
      location: String!
    ): Incident

    updateIncidentStatus(
      id: ID!
      status: String!
    ): Incident

    deleteIncident(id: ID!): String
  
  createPollingUnit(
    name: String!
    code: String!
    state: String!
    lga: String!
  ): PollingUnit

  updatePollingUnitStatus(
    id: ID!
    status: String!
  ): PollingUnit

   submitResult(
    pollingUnit: String!
    candidate: String!
    votes: Int!
  ): Result
 
  
}
`;
