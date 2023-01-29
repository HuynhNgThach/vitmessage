import { User } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { GraphQlContext, CreateUsernameResponse } from "../../utils/types";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQlContext
    ): Promise<Array<User>> => {
      const { username: searchUsername } = args;
      const { session, prisma } = context;
      console.log("hit resolver search users", searchUsername);
      if (!session?.user) {
        throw new ApolloError("Not authorized!");
      }
      const { username: myUsername } = session.user;
      try {
        const users = await prisma.user.findMany({
          where: {
            username: {
              contains: searchUsername,
              not: myUsername,
              mode: "insensitive",
            },
          },
        });
        return users;
      } catch (error: any) {
        console.log("Search user error", error.message);
        throw new ApolloError(error.message);
      }
    },
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQlContext
    ): Promise<CreateUsernameResponse> => {
      const { session, prisma } = context;
      const { username } = args;
      if (!session?.user) {
        return {
          error: "Not authorized!",
        };
      }
      const { id } = session?.user;
      try {
        const existUser = await prisma.user.findUnique({
          where: {
            username,
          },
        });
        if (existUser) {
          return {
            error: "Username already taken. Try another!",
          };
        }

        await prisma.user.update({
          where: {
            id,
          },
          data: {
            username,
          },
        });
        return { success: true };
      } catch (error: any) {
        return {
          error: error?.message,
        };
      }
    },
  },
  //Subscription: {},
};
export default resolvers;
