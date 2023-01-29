import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Modal,
  Stack,
  Button,
  Input,
} from "@chakra-ui/react";
import React, { use, useState } from "react";
import UserOperations from "../../../../graphql/operations/user";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  SearchUser,
  SearchUserInput,
  SearchUsersData,
  CreateConversationData,
  CreateConversationInput,
} from "@/utils/types";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import { toast } from "react-hot-toast";
import conversationOp from "@/graphql/operations/conversation";
import { useMutation } from "@apollo/client";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

const ConversationModal: React.FC<Props> = ({ isOpen, onClose, session }) => {
  const [username, setUsername] = useState("");
  const {
    user: { id: userId },
  } = session;
  const router = useRouter();
  const [participants, setParticipants] = useState<Array<SearchUser>>([]);
  const [searchUsers, { data, error, loading }] = useLazyQuery<
    SearchUsersData,
    SearchUserInput
  >(UserOperations.Queries.searchUsers);
  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationInput>(
      conversationOp.Mutations.createConversation
    );
  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    searchUsers({ variables: { username } });
  };
  const addParticipant = (user: SearchUser) => {
    setParticipants((prev) => [...prev, user]);
    setUsername("");
  };
  const removeParticipant = (userId: string) => {
    setParticipants((prev) => prev.filter((i) => i.id !== userId));
  };
  const onCreateConversation = async () => {
    try {
      const { data } = await createConversation({
        variables: {
          participantIds: [userId, ...participants.map((i) => i.id)],
        },
      });
      console.log("Created conversation data", data);
      if (!data?.createConversation)
        throw new Error("Failed to create new conversation");
      const {
        createConversation: { conversationId },
      } = data;
      router.push({ query: { conversationId } });
      //Clear state and close modal on successful creation
      setParticipants([]);
      setUsername("");
      onClose();
    } catch (error: any) {
      console.log("onCreateConversation error ", error);
      toast.error(error?.message);
    }
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#2d2d2d" pb={4}>
          <ModalHeader>Create a Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSearch}>
              <Stack>
                <Input
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button
                  type="submit"
                  isDisabled={!username}
                  isLoading={loading}
                >
                  Search
                </Button>
              </Stack>
            </form>
            {data?.searchUsers && (
              <UserSearchList
                users={data?.searchUsers}
                addParticipant={addParticipant}
              />
            )}
            {participants.length > 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipant={removeParticipant}
                />
                <Button
                  bg="brand.100"
                  width="100%"
                  mt={6}
                  _hover={{ bg: "brand.100" }}
                  onClick={onCreateConversation}
                  isLoading={createConversationLoading}
                >
                  Create Conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConversationModal;
