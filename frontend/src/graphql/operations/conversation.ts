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
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated{
        conversationCreated {
          ${conversationFields}
        }
      }
    `,
  },
};
export default conversationOp;
