
// hooks/useProfilePhoto.ts
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";

export function useProfilePhoto() {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let revokedUrl: string | undefined;
    if (!accounts.length) {
      setPhotoUrl(null);
      return;
    }

    const getPhoto = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accessToken = await instance.acquireTokenSilent({
          scopes: ["User.Read"],
          account: accounts[0],
        }).then(res => res.accessToken);

        const photoResponse = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (photoResponse.ok) {
          const blob = await photoResponse.blob();
          const url = URL.createObjectURL(blob);
          setPhotoUrl(url);
          revokedUrl = url;
        } else {
          setPhotoUrl(null);
        }
      } catch (e: any) {
        setPhotoUrl(null);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    getPhoto();

    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [instance, accounts]);

  return { photoUrl, isLoading, error };
}