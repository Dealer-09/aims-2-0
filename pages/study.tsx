import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

export default function StudyPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/"); // 🚀 Redirect if not signed in
      } else {
        checkApproval(user?.primaryEmailAddress?.emailAddress);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const checkApproval = async (email: string | undefined) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/check-approval?email=${email}`);
      const data = await res.json();
      setApproved(data.approved);
    } catch (error) {
      console.error("Error checking approval:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!approved) return <p>Access Denied. You are not approved.</p>;

  return (
    <div>
      <h2>Study Materials</h2>
      <p>Welcome, you have access to your study materials.</p>
    </div>
  );
}
