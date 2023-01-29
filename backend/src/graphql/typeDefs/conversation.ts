import { gql } from "apollo-server-core";

const typeDefs = gql`
  scalar Date
  type Mutation {
    createConversation(participantIds: [String]): ConversationResponse
  }
  type ConversationResponse {
    conversationId: String
  }
  type Query {
    conversations: [Conversation]
  }
  type Conversation {
    id: String
    participants: [Participant]
    latestMessage: Message
    createdAt: Date
    updatedAt: Date
  }
  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
  }
  type Subscription {
    conversationCreated: Conversation
  }
`;
export default typeDefs;
