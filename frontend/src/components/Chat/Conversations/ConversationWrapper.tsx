import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOp from "../../../graphql/operations/conversation";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  ConversationDeletedData,
  ConversationsData,
  ConversationUpdatedData,
} from "@/utils/types";
import {
  ConversationPopulated,
  ParticipantPopulated,
} from "../../../../../backend/src/utils/types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "@/common/SkeletonLoader";
import conversationOp from "../../../graphql/operations/conversation";
import { gql } from "@apollo/client";

interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;
  const {
    data: conversationData,
    error: conversationError,
    loading: conversationLoading,
    subscribeToMore,
  } = useQuery<ConversationsData, null>(ConversationOp.Queries.conversations);

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(conversationOp.Mutations.markConversationAsRead);

  useSubscription<ConversationUpdatedData, null>(
    conversationOp.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;
        console.log("On data firing", subscriptionData);
        if (!subscriptionData) return;
        const {
          conversationUpdated: { conversation: updatedConversation },
        } = subscriptionData;
        const currViewConversation = updatedConversation.id === conversationId;
        currViewConversation && onViewConversation(conversationId, false);
      },
    }
  );
  useSubscription<ConversationDeletedData, null>(
    conversationOp.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        console.log("on sub", data);

        const { data: subscriptionData } = data;
        if (!subscriptionData) return;
        const existing = client.readQuery<ConversationsData>({
          query: conversationOp.Queries.conversations,
        });
        if (!existing) return;
        const { conversations } = existing;

        const {
          conversationDeleted: { id: deletedConversationId },
        } = subscriptionData;
        client.writeQuery<ConversationsData>({
          query: conversationOp.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (c) => c.id !== deletedConversationId
            ),
          },
        });
        router.push("/");
      },
    }
  );

  const {
    user: { id: userId },
  } = session;

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => {
    router.push({ query: { conversationId } });

    /**
     * Only mark as read if conversation is unread
     */
    if (hasSeenLatestMessage) return;

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: (cache) => {
          /**
           * Get conversation participants
           * from cache
           */
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          /**
           * Create copy to
           * allow mutation
           */
          const participants = [...participantsFragment.participants];

          const userParticipantIdx = participants.findIndex(
            (p) => p.user.id === userId
          );

          /**
           * Should always be found
           * but just in case
           */
          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];

          /**
           * Update user to show latest
           * message as read
           */
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error) {
      console.log("onViewConversation error", error);
    }
  };
  const subscribeToMoreConversation = () => {
    subscribeToMore({
      document: ConversationOp.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;
        const newConversation = subscriptionData.data.conversationCreated;
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };
  //execute subscription on mount
  useEffect(() => {
    subscribeToMoreConversation();
  }, []);
  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.100"
      flexDirection="column"
      gap={4}
      py={6}
      px={3}
    >
      {conversationLoading ? (
        <SkeletonLoader count={7} width="100%" height="100px" />
      ) : (
        <ConversationList
          session={session}
          onViewConversation={onViewConversation}
          conversations={conversationData?.conversations || []}
        />
      )}
    </Box>
  );
};

export default ConversationWrapper;
