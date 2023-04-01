import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";
import {
  GraphQlContext,
  MessagePopulated,
  MessageSentSubscriptionPayload,
  SendMessageArguments,
} from "../../utils/types";
import { conversationPopulated } from "./conversation";

const resolvers = {
  Query: {
    messages: async (
      _: any,
      args: { conversationId: string },
      context: GraphQlContext
    ): Promise<Array<MessagePopulated>> => {
      const { session, prisma } = context;
      const { conversationId } = args;
      if (!session?.user) throw new GraphQLError("Not Authorized");

      const {
        user: { id: userId },
      } = session;
      //verify that user make request is participant of conversation, conversation exist
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });
      if (!conversation) throw new GraphQLError("Conversation not found");
      const allowToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );
      if (!allowToView) throw new GraphQLError("Not Authorized");
      try {
        const messages = prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });
        return messages;
      } catch (error: any) {
        console.log("mesaages error", error.message);
        throw new GraphQLError(error.message);
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArguments,
      context: GraphQlContext
    ): Promise<boolean> => {
      console.log("hit send");

      const { session, prisma, pubsub } = context;
      if (!session?.user) throw new GraphQLError("Not Authorized!");

      const { id: userId } = session.user;
      const { id: messageId, senderId, conversationId, body } = args;

      if (userId !== senderId) throw new GraphQLError("Not Authorized!");

      try {
        console.time("doSomething");

        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        //const participant = await prisma.conversationParticipant.findFirst({
        //  where: {
        //    userId,
        //    conversationId,
        //  },
        //});
        //if (!participant) throw new GraphQLError("Participant does not exist");
        ////update conversation entity
        //const conversation = await prisma.conversation.update({
        //  where: {
        //    id: conversationId,
        //  },
        //  data: {
        //    latestMessageId: newMessage.id,
        //    participants: {
        //      update: {
        //        where: {
        //          id: participant.id,
        //        },
        //        data: {
        //          hasSeenLatestMessage: true,
        //        },
        //      },
        //      updateMany: {
        //        where: {
        //          NOT: {
        //            userId,
        //          },
        //        },
        //        data: {
        //          hasSeenLatestMessage: false,
        //        },
        //      },
        //    },
        //  },
        //  include: conversationPopulated,
        //});
        console.timeEnd("doSomething");
        console.time("emit");
        //console.log("new mess ", newMessage);

        pubsub.publish("MESSAGE_SENT", {
          messageSent: newMessage,
        });
        //pubsub.publish("CONVERSATION_UPDATED", {
        //  conversationUpdated: {
        //    conversation,
        //  },
        //});
        console.timeEnd("emit");
      } catch (error: any) {
        console.log("Sent message error", error.message);
        throw new GraphQLError("Sent message error");
      }
      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator("MESSAGE_SENT");
        },
        (
          payload: MessageSentSubscriptionPayload,
          args: { conversationId: string },
          context: GraphQlContext
        ) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});
export default resolvers;
