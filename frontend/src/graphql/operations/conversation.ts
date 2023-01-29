import { gql } from "@apollo/client";

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
      id
      sender {
        id
        username
      }
      body
      createdAt
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
