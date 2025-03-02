import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function SignInPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (user?.publicMetadata?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/study");
      }
    }
  }, [isSignedIn, isLoaded, user, router]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Sign In</h2>
      <SignIn />
    </div>
  );
}