import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import React from "react";
import MessageHeader from "./Messages/Header";

type Props = {
  session: Session;
};

const FeedWrapper: React.FC<Props> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;

  const {
    user: { id: userId },
  } = session;
  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
    >
      {conversationId && typeof conversationId === "string" ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexGrow={1}
          border="1px solid red"
        >
          <MessageHeader userId={userId} conversationId={conversationId} />
        </Flex>
      ) : (
        <div>No conversation selected</div>
      )}
    </Flex>
  );
};

export default FeedWrapper;
