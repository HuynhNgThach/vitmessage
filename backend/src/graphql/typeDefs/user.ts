import { gql } from "apollo-server-core";

const typeDefs = gql`
  type SearchUser {
    id: String
    username: String
  }
  type Query {
    searchUsers(username: String): [SearchUser]
  }
  type Mutation {
    createUsername(username: String): CreateUserResponse
  }
  type CreateUserResponse {
    success: Boolean
    error: String
  }
  type User {
    id: String
    username: String
    email: String
    emailVerified: Boolean
    image: String
    name: String
  }
`;
export default typeDefs;
