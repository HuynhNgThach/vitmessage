import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import React from "react";
import { MessagePopulated } from "../../../../../../backend/src/utils/types";

interface Props {
  message: MessagePopulated;
  sentByMe: boolean;
}
const formatRelativeLocale = {
  lastWeek: "eee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "p",
  other: "MM/dd/y",
};

const MessageItem: React.FC<Props> = ({ sentByMe, message }) => {
  return (
    <Stack
      direction="row"
      spacing={4}
      _hover={{ bg: "whiteAlpha.200" }}
      wordBreak="break-word"
      p={4}
    >
      {!sentByMe && (
        <Flex align="flex-end">
          <Avatar size="sm"></Avatar>
        </Flex>
      )}
      <Stack spacing={1} width="100%">
        <Stack
          direction="row"
          align="center"
          justify={sentByMe ? "flex-end !important" : "flex-start !important"}
        >
          {!sentByMe && (
            <Text fontWeight={500} textAlign="left">
              {message.sender.username}
            </Text>
          )}
          <Text fontSize={14} color="whiteAlpha.700">
            {formatRelative(new Date(message.createdAt), new Date(), {
              locale: {
                ...enUS,
                formatRelative: (token) =>
                  formatRelativeLocale[
                    token as keyof typeof formatRelativeLocale
                  ],
              },
            })}
          </Text>
        </Stack>
        <Flex
          justify={sentByMe ? "flex-end !important" : "flex-start !important"}
        >
          <Box
            bg={sentByMe ? "brand.100" : "whiteAlpha.300"}
            px="2"
            py="1"
            borderRadius={12}
            maxWidth="65%"
          >
            <Text>{message.body}</Text>
          </Box>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default MessageItem;
