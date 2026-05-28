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


type AuthPayload {
  token: String!
  user: User!
}
type Query {
  getUsers: [User]
  getIncidents: [Incident]
  getIncident(id: ID!): Incident
  
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
  

 
  
}
`;
