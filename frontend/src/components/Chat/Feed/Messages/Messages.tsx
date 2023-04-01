import messageOp from "@/graphql/operations/message";
import {
  MessagesData,
  MessageSubscriptionData,
  MessagesVariables,
} from "@/utils/types";
import { useQuery } from "@apollo/client";
import { Flex, Stack, Button } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import SkeletonLoader from "@/common/SkeletonLoader";
import MessageItem from "./MessageItem";

interface Props {
  conversationId: string;
  userId: string;
}

const Messages: React.FC<Props> = ({ conversationId, userId }) => {
  const { data, loading, error, subscribeToMore, refetch } = useQuery<
    MessagesData,
    MessagesVariables
  >(messageOp.Queries.messages, {
    variables: {
      conversationId,
    },
    //pollInterval: 500,
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  const subscribeToMoreMessages = (conversationId: string) => {
    console.log("hit subscribe to more");
    return subscribeToMore({
      document: messageOp.Subscriptions.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        console.log("HERE IS SUBSCRIPTION DATA", subscriptionData);

        if (!subscriptionData) return prev;
        const newMessage = subscriptionData.data.messageSent;

        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
          //[newMessage, ...prev.messages],
        });
      },
    });
  };
  useEffect(() => {
    const unsubscribe = subscribeToMoreMessages(conversationId);

    return () => unsubscribe();
  }, [conversationId]);
  if (error) return null;

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden" height="100%">
      {loading && (
        <Stack spacing={4} px="4">
          <SkeletonLoader count={4} height="60px" width="100%" />
        </Stack>
      )}
      {data?.messages && (
        <>
          <Flex direction="column-reverse" overflowY="scroll" height="100%">
            {data.messages.map((mess) => (
              <MessageItem
                key={mess.id}
                message={mess}
                sentByMe={mess.sender.id === userId}
              />
            ))}
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default Messages;
