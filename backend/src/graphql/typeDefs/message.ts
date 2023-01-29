import gql from "graphql-tag";

const typeDefs = gql`
  type Message {
    id: String
    body: String
    sender: User
    createdAt: Date
  }
`;
export default typeDefs;
