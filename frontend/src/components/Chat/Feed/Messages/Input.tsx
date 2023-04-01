import { Session } from "next-auth";
import { border, Box, Input } from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@apollo/client";
import messageOp from "@/graphql/operations/message";
import { SendMessageArguments } from "../../../../utils/types";
import { ObjectID } from "bson";
import { MessagesData } from "@/utils/types";

interface MessageProps {
  session: Session;
  conversationId: string;
}
const MessageInput: React.FC<MessageProps> = ({ session, conversationId }) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    SendMessageArguments
  >(messageOp.Mutations.sendMessage);

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      //call send message mutation
      const { id: senderId } = session.user;
      const messageId = new ObjectID().toString();
      const newMessage: SendMessageArguments = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };
      setMessageBody("");
      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
        },
        optimisticResponse: {
          sendMessage: true,
        },
        update: (cache) => {
          const existing = cache.readQuery<MessagesData>({
            query: messageOp.Queries.messages,
            variables: { conversationId },
          }) as MessagesData;
          console.log("EXISTING CACHE", existing);

          cache.writeQuery<MessagesData, { conversationId: string }>({
            query: messageOp.Queries.messages,
            variables: { conversationId },
            data: {
              //...existing,
              messages: [
                {
                  id: messageId,
                  body: messageBody,
                  conversationId,
                  senderId: session.user.id,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing?.messages,
              ],
            },
          });
        },
      });
      if (!data?.sendMessage || errors)
        throw new Error("Failed to sent message");
    } catch (error: any) {
      console.log("Send message error", error);
      toast.error(error?.message);
    }
  };
  return (
    <>
      <Box px={4} py={6}>
        <form onSubmit={onSendMessage}>
          <Input
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="New message"
            _focus={{
              boxShadow: "none",
              border: "1px solid ",
              borderColor: "whiteAlpha.300",
            }}
          />
        </form>
      </Box>
    </>
  );
};

export default MessageInput;
