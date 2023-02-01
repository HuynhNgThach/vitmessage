import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/utils/types";

export interface CreateUsernameData {
  createUsername: {
    success: boolean;
    error: string;
  };
}
export interface CreateUsernameVariable {
  username: string;
}

export interface SearchUsersData {
  searchUsers: Array<SearchUser>;
}
export interface SearchUser {
  id: string;
  username: string;
}
export interface SearchUserInput {
  username: string;
}
export interface CreateConversationData {
  createConversation: {
    conversationId: string;
  };
}
export interface CreateConversationInput {
  participantIds: Array<string>;
}

export interface ConversationsData {
  conversations: Array<ConversationPopulated>;
}
export interface ConversationUpdatedData {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}
export interface ConversationDeletedData {
  conversationDeleted: {
    id: string;
  };
}

export interface MessagesData {
  messages: Array<MessagePopulated>;
}
export interface MessagesVariables {
  conversationId: string;
}
export interface MessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}
