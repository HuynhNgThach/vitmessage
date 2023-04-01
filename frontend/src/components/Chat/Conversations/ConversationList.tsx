import conversationOp from "@/graphql/operations/conversation";
import { useMutation } from "@apollo/client";
import { Box, Text, Button } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ConversationPopulated } from "../../../utils/types";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./Modal/ConversationModal";
import { signOut } from "next-auth/react";

interface Props {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void;
}

const ConversationList: React.FC<Props> = ({
  session,
  conversations,
  onViewConversation,
}) => {
  const {
    user: { id: userId },
  } = session;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => {
    setIsOpen(true);
  };
  const [deleteConversation] = useMutation<
    { deleteConversation: boolean },
    { conversationId: string }
  >(conversationOp.Mutations.deleteConversation);
  const onClose = () => setIsOpen(false);
  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            router.replace(
              typeof process.env.NEXT_PUBLIC_BASE_URL === "string"
                ? process.env.NEXT_PUBLIC_BASE_URL
                : ""
            );
          },
        }),
        {
          loading: "Deleting conversation",
          success: "Conversation deleted",
          error: "Fail to delete conversation",
        }
      );
    } catch (error: any) {
      console.log("OnDeleteConversation error", error.message);
    }
  };
  const sortedConversations = [...conversations].sort((a, b) => {
    console.log(new Date(b.updatedAt).valueOf());

    return new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf();
  });
  return (
    <Box width="100%" position={"relative"} height="100%">
      <Box
        py={2}
        px={4}
        mb={4}
        bg="blackAlpha.300"
        borderRadius={4}
        cursor="pointer"
        onClick={onOpen}
      >
        <Text textAlign="center" fontWeight={500}>
          Find or create new conversation
        </Text>
      </Box>
      <ConversationModal
        isOpen={isOpen}
        onClose={onClose}
        session={session}
      ></ConversationModal>
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.user.id === userId
        );
        if (participant === undefined) {
          throw new TypeError("Participant is undefined");
        }

        return (
          <ConversationItem
            userId={userId}
            conversation={conversation}
            key={conversation.id}
            onClick={() =>
              onViewConversation(
                conversation.id,
                participant?.hasSeenLatestMessage
              )
            }
            onDeleteConversation={onDeleteConversation}
            hasSeenLatestMessage={participant?.hasSeenLatestMessage}
            isSelected={conversation.id === router.query.conversationId}
          />
        );
      })}
      <Box position={"absolute"} bottom={0} left={0} width="100%" px={8}>
        <Button width="100%" onClick={() => signOut()}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationList;
