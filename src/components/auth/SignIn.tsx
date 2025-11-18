import { useMsal } from "@azure/msal-react";
import { Button } from "@mantine/core";

export default function SignIn() {
    const { instance } = useMsal();

    return (
        <Button onClick={() => instance.loginRedirect()}>Sign In</Button>
    )
}
