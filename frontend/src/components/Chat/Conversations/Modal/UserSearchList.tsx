import { SearchUser } from "@/utils/types";
import { Stack, Text, Flex, Avatar, Button } from "@chakra-ui/react";
import React from "react";

interface Props {
  users: Array<SearchUser>;
  addParticipant: (user: SearchUser) => void;
}

const UserSearchList: React.FC<Props> = ({ users, addParticipant }) => {
  return (
    <>
      {users.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No user found!</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {users.map((user) => (
            <Flex
              key={user.id}
              align="center"
              gap={4}
              py={4}
              px={4}
              borderRadius={4}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Avatar />
              <Flex justify={"space-between"} align="center" width="100%">
                <Text color="whiteAl">{user.username}</Text>
                <Button
                  bg="brand.100"
                  _hover={{ bg: "brand.100" }}
                  onClick={() => {
                    addParticipant(user);
                  }}
                >
                  Select
                </Button>
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}
    </>
  );
};

export default UserSearchList;
