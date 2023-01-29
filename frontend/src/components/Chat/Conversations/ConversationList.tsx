import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./Modal/ConversationModal";

interface Props {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversation: (conversationId: string) => void;
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
  const onClose = () => setIsOpen(false);
  return (
    <Box width="100%">
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
      {conversations.map((conversation) => (
        <ConversationItem
          userId={userId}
          conversation={conversation}
          key={conversation.id}
          onClick={() => onViewConversation(conversation.id)}
          isSelected={conversation.id === router.query.conversationId}
        />
      ))}
    </Box>
  );
};

export default ConversationList;
