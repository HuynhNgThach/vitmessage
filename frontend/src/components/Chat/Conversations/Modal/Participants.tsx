import { SearchUser } from "@/utils/types";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
interface Props {
  participants: Array<SearchUser>;
  removeParticipant: (userId: string) => void;
}

const Participants: React.FC<Props> = ({ participants, removeParticipant }) => {
  return (
    <Flex mt={8} gap="10px" flexWrap="wrap">
      {participants.map((participant) => (
        <Flex
          key={participant.id}
          align="center"
          gap={2}
          bg="whiteAlpha.200"
          borderRadius={5}
          padding="2"
        >
          <Text>{participant.username}</Text>
          <IoIosCloseCircleOutline
            size={20}
            cursor="pointer"
            onClick={() => {
              removeParticipant(participant.id);
            }}
          />
        </Flex>
      ))}
    </Flex>
  );
};

export default Participants;
