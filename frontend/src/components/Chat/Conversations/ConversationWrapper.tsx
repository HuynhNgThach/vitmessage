import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import ConversationOp from "../../../graphql/operations/conversation";
import { useQuery } from "@apollo/client";
import { ConversationsData } from "@/utils/types";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  const {
    data: conversationData,
    error: conversationError,
    loading: conversationLoading,
    subscribeToMore,
  } = useQuery<ConversationsData, null>(ConversationOp.Queries.conversations);
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;
  const onViewConversation = async (conversationId: string) => {
    //1. Push the conversationId to router query params
    router.push({ query: { conversationId } });
    //2. Mark the conversation as read
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
      py={6}
      px={3}
    >
      <ConversationList
        session={session}
        onViewConversation={onViewConversation}
        conversations={conversationData?.conversations || []}
      />
    </Box>
  );
};

export default ConversationWrapper;
