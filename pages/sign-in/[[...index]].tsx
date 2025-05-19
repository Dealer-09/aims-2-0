import { useEffect } from "react";
import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function SignInPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
      const email = user.emailAddresses[0].emailAddress;

      // Check if user is approved in Firebase
      fetch(`/api/check-approval?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.approved) {
            if (data.role === "admin") {
              router.push("/admin");
            } else {
              router.push("/study");
            }
          } else {
            // Not approved - show message and sign out
            alert(data.message || "You are not approved to access this site. Please request access first.");
            router.push("/request-access");
          }
        })
        .catch((err) => {
          console.error("Error checking approval:", err);
          alert("Error checking access status. Please try again.");
        });
    }
  }, [isSignedIn, isLoaded, user, router]);

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Sign In</h1>
      <SignIn redirectUrl={user?.publicMetadata?.role === "admin" ? "/admin" : "/study"} />
    </div>
  );
}