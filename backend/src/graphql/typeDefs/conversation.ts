import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date
  type Mutation {
    createConversation(participantIds: [String]): ConversationResponse
  }
  type Mutation {
    markConversationAsRead(conversationId: String, userId: String): Boolean
  }
  type Mutation {
    deleteConversation(conversationId: String): Boolean
  }
  type ConversationResponse {
    conversationId: String
  }
  type Query {
    conversations: [Conversation]
  }
  type ConversationUpdatedSubscriptionPayload {
    conversation: Conversation
  }
  type ConversationDeletedPayload {
    id: String
    latestMessageId: String
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
  type Subscription {
    conversationUpdated: ConversationUpdatedSubscriptionPayload
  }
  type Subscription {
    conversationDeleted: ConversationDeletedPayload
  }
`;
export default typeDefs;
