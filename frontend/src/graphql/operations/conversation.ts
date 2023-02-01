import { gql } from "@apollo/client";
import { MessageFields } from "./message";

const conversationFields = `
    id
    participants {
      user {
        id
        username
      }
      hasSeenLatestMessage
    }
    latestMessage {
      ${MessageFields}
    }
    updatedAt
`;

const conversationOp = {
  Queries: {
    conversations: gql`
      query Conversations {
       conversations {
         ${conversationFields}
       }
      }
    `,
  },
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantIds: [String]!) {
        createConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $conversationId: String
        $userId: String
      ) {
        markConversationAsRead(conversationId: $conversationId, userId: $userId)
      }
    `,
    deleteConversation: gql`
      mutation DeleteConversation($conversationId: String) {
        deleteConversation(conversationId: $conversationId)
      }
    `,
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${conversationFields}
        }
      }
    `,
    conversationUpdated: gql`
      subscription ConversationUpdated {
        conversationUpdated {
          conversation {
            ${conversationFields}
          }
        }
      }
    `,
    conversationDeleted: gql`
      subscription ConversationDeleted {
        conversationDeleted {
          id
          latestMessageId
        }
      }
    `,
  },
};
export default conversationOp;
