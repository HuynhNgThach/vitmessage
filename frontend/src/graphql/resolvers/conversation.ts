import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import {
  ConversationDeletedSubscriptionPayload,
  ConversationPopulated,
  ConversationUpdatedSubscriptionPayload,
  GraphQlContext,
  ParticipantIds,
} from "../../utils/types";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: GraphQlContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;
      if (!session?.user) throw new GraphQLError("Not Authorized");
      const {
        user: { id: userId },
      } = session;
      try {
        const conversations = await prisma.conversation.findMany({
          //where: {
          //  participants: {
          //    some: {
          //      userId: {
          //        equals: userId,
          //      },
          //    },
          //  },
          //},
          include: conversationPopulated,
        });
        console.log("hit conversation", JSON.stringify(conversations), userId);

        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
        //return conversations;
      } catch (error: any) {
        console.log("Conversation error", error.message);
        throw new GraphQLError(error.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: ParticipantIds,
      context: GraphQlContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context;
      const { participantIds } = args;
      if (!session?.user) throw new GraphQLError("Not Authorized");

      const {
        user: { id: userId },
      } = session;
      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });
        return {
          conversationId: conversation.id,
        };
      } catch (error: any) {
        console.log("Create conversation error", error.message);
        throw new GraphQLError("Create conversation error");
      }
    },
    markConversationAsRead: async (
      _: any,
      args: { userId: string; conversationId: string },
      context: GraphQlContext
    ): Promise<boolean> => {
      const { session, prisma } = context;
      const { userId, conversationId } = args;

      if (!session?.user) throw new GraphQLError("Not authenticated!");
      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });
        if (!participant) throw new GraphQLError("Participant not existed");
        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });
        return true;
      } catch (error: any) {
        console.log("Mark conversation as read error ", error.message);
        throw new GraphQLError(error.message);
      }
    },
    deleteConversation: async (
      _: any,
      args: { conversationId: string },
      context: GraphQlContext
    ): Promise<boolean> => {
      const { session, pubsub, prisma } = context;
      const { conversationId } = args;
      if (!session?.user) throw new GraphQLError("Not authenticated");
      try {
        //delete conversation and all related entities
        const [deletedConversation] = await prisma.$transaction([
          prisma.conversation.delete({
            where: {
              id: conversationId,
            },
            include: conversationPopulated,
          }),
          prisma.conversationParticipant.deleteMany({
            where: {
              conversationId,
            },
          }),
          prisma.message.deleteMany({
            where: {
              conversationId,
            },
          }),
        ]);
        pubsub.publish("CONVERSATION_DELETED", {
          conversationDeleted: deletedConversation,
        });
      } catch (error: any) {
        console.log("Delete conversation error", error.message);
        throw new GraphQLError("Fail to delete coversation");
      }

      return true;
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          __: any,
          context: GraphQlContext
        ) => {
          const { session } = context;
          const {
            conversationCreated: { participants },
          } = payload;
          const userIsParticipant = !!participants.find(
            (p) => p.userId === session?.user.id
          );
          return userIsParticipant;
        }
      ),
    },
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: ConversationUpdatedSubscriptionPayload,
          __: any,
          context: GraphQlContext
        ) => {
          console.log("here is conversation updated payload ", payload);

          const { session } = context;
          if (!session?.user) throw new GraphQLError("Not authenticated");

          const { id: userId } = session.user;
          const {
            conversationUpdated: {
              conversation: { participants },
            },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(
            participants,
            userId
          );
          return userIsParticipant;
        }
      ),
    },
    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
        },
        (
          payload: ConversationDeletedSubscriptionPayload,
          __: any,
          context: GraphQlContext
        ) => {
          if (!context.session?.user)
            throw new GraphQLError("Not authenticated");
          const {
            user: { id: userId },
          } = context.session;
          const {
            conversationDeleted: { participants },
          } = payload;
          const userIsParticipant = userIsConversationParticipant(
            participants,
            userId
          );
          return userIsParticipant;
        }
      ),
    },
  },
};
export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });
export default resolvers;
