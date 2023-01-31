import { Prisma, PrismaClient } from "@prisma/client";
import { ISODateString } from "next-auth";
import { PubSub } from "graphql-subscriptions";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/resolvers/conversation";
import { Context } from "graphql-ws/lib/server";
import { messagePopulated } from "../graphql/resolvers/message";

export interface CreateUsernameResponse {
  success?: boolean;
  error?: string;
}
export interface Session {
  user: User;
  expires: ISODateString;
}
export interface User {
  id: string;
  username: string;
  image: string;
  email: string;
  name: string;
}
export interface GraphQlContext {
  session: Session | null;
  prisma: PrismaClient;
  pubsub: PubSub;
}
export interface SubscriptionContext extends Context {
  connectionParams: {
    session?: Session;
  };
}

export interface ParticipantIds {
  participantIds: Array<string>;
}
export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface SendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;
