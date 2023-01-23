import Auth from "@/components/Auth/Auth";
import Chat from "@/components/Chat/Chat";
import { Box } from "@chakra-ui/react";
import type { NextPage, NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";

const Home: NextPage = () => {
  const session = useSession().data;
  const reloadSession = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  return (
    <Box>
      {session?.user.username ? (
        <Chat />
      ) : (
        <Auth session={session} reloadSession={reloadSession} />
      )}
    </Box>
  );
};
export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  console.log("server session get ", session);
  return {
    props: {
      session,
    },
  };
}

export default Home;
