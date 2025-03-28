import { useEffect } from "react";
import { useUser, SignUp } from "@clerk/nextjs";
import { useRouter } from "next/router";

export default function SignUpPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const email = user?.primaryEmailAddress?.emailAddress; // ✅ Get email
      if (!email) return;

      // ✅ Fetch user role before assigning or redirecting
      fetch("/api/get-user-role")
        .then((res) => res.json())
        .then((data) => {
          if (data.role === "admin") {
            router.push("/admin"); // 🚀 Redirect admins
          } else if (data.role === "student") {
            router.push("/study"); // 🚀 Redirect students
          } else {
            alert("Your account is not approved yet.");
            router.push("/sign-in");
          }
        })
        .catch((err) => {
          console.error("Error checking role:", err);
          router.push("/sign-in"); // ❌ Redirect to sign-in if error
        });
    }
  }, [isSignedIn, isLoaded, user, router]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h2>Sign Up</h2>
      <SignUp />
    </div>
  );
}