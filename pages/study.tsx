
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { db, collection, getDocs, query, where } from "@/utils/firebase";

export default function StudyPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfs, setPdfs] = useState<Array<{ url: string; filename: string }>>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);
  const [pdfsError, setPdfsError] = useState("");
  const [userClass, setUserClass] = useState<string | null>(null);
  const [userSubject, setUserSubject] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/");
      } else {
        checkApprovalAndFetchUser(user?.primaryEmailAddress?.emailAddress, user?.id);
      }
    }
    //
  }, [isLoaded, isSignedIn, user, router]);

  // Check approval and get user class/subject
  const checkApprovalAndFetchUser = async (email: string | undefined, userId: string | undefined) => {
    if (!email || !userId) return;
    try {
      const res = await fetch(`/api/check-approval?email=${email}`);
      const data = await res.json();
      setApproved(data.approved);
      if (data.approved) {
        // Fetch user class/subject from Firestore
        const userDocRes = await fetch(`/api/get-user-role`, {
          method: "GET",
          headers: { Authorization: `Bearer ${userId}` },
        });
        const userDoc = await userDocRes.json();
        setUserClass(userDoc.class || null);
        setUserSubject(userDoc.subject || null);
      }
    } catch {
      // Error checking approval
    } finally {
      setLoading(false);
    }
  };

  // Fetch PDFs for user's class/subject
  useEffect(() => {
    if (!approved || !userClass || !userSubject) return;
    setPdfsLoading(true);
    setPdfsError("");
    (async () => {
      try {
        const q = query(
          collection(db, "pdfs"),
          where("class", "==", userClass),
          where("subject", "==", userSubject)
        );
        const querySnapshot = await getDocs(q);
        setPdfs(
          querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              url: data.url ?? "",
              filename: data.filename ?? "",
            };
          })
        );
      } catch {
        setPdfsError("Failed to load PDFs");
      } finally {
        setPdfsLoading(false);
      }
    })();
  }, [approved, userClass, userSubject]);

  if (loading) return <p>Loading...</p>;
  if (!approved) return <p>Access Denied. You are not approved.</p>;

  return (
    <div>
      <h2>Study Materials</h2>
      {pdfsLoading ? <p>Loading PDFs...</p> : null}
      {pdfsError ? <p style={{ color: 'red' }}>{pdfsError}</p> : null}
      {pdfs.length > 0 ? (
        <ul>
          {pdfs.map((pdf, idx) => (
            <li key={idx} style={{ marginBottom: 8 }}>
              <a href={pdf.url} target="_blank" rel="noopener noreferrer">{pdf.filename}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No study materials found for your class/subject.</p>
      )}
    </div>
  );
}
