import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import * as React from "react";
import { signIn } from "next-auth/react";
import { Session } from "next-auth";
import UserOperations from "../../graphql/operations/user";
import { useMutation } from "@apollo/client";
import { CreateUsernameData, CreateUsernameVariable } from "@/utils/types";
import { toast } from "react-hot-toast";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = React.useState("");
  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameData,
    CreateUsernameVariable
  >(UserOperations.Mutations.createUsername);
  console.log("here is data", error, loading);
  const onSubmit = async () => {
    try {
      //create username
      if (!username) return;
      const { data } = await createUsername({ variables: { username } });
      if (!data?.createUsername) {
        throw new Error();
      }
      if (data.createUsername.error) {
        const { error } = data.createUsername;
        throw new Error(error);
      }
      toast.success("Username successfully created!");
      //reload session to obtain new username
      reloadSession();
    } catch (error: any) {
      console.log("onsubmit error", error?.message);
      toast.error(error?.message);
    }
  };
  return (
    <div>
      <Center height="100vh">
        <Stack align="center" spacing={8}>
          {session ? (
            <>
              <Text fontSize="3xl">Create a username</Text>
              <Input
                placeholder="Type username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></Input>
              <Button width="100%" onClick={onSubmit} isLoading={loading}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Text fontSize="3xl">VitMesaage</Text>
              <Button
                onClick={() => signIn("google")}
                leftIcon={<Image height="20px" src="/images/googlelogo.png" />}
              >
                Continue with Google
              </Button>
            </>
          )}
        </Stack>
      </Center>
    </div>
  );
};

export default Auth;
