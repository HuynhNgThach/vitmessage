import { GraphQlContext, CreateUsernameResponse } from "../../utils/types";

const resolvers = {
  Query: {
    searchUsers: () => {},
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
