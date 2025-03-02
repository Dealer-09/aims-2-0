import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type Material = {
  id: string;
  title: string;
  link: string;
};

export default function StudyMaterials() {
  const { user, isLoaded } = useUser();
  const [materials, setMaterials] = useState<Material[]>([]); // ✅ Correct typing

  useEffect(() => {
    async function fetchMaterials() {
      if (user?.emailAddresses[0].emailAddress) {
        const res = await fetch(`/api/getMaterials?email=${user.emailAddresses[0].emailAddress}`);
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    }
    fetchMaterials();
  }, [user]);

  if (!isLoaded) return <p>Loading...</p>;
  if (!user) return <p>Please log in to access study materials.</p>;

  return (
    <section>
      <h2>Your Study Materials</h2>
      <ul>
        {materials.length > 0 ? (
          materials.map((material) => (
            <li key={material.id}>
              <a href={material.link} target="_blank" rel="noopener noreferrer">{material.title}</a>
            </li>
          ))
        ) : (
          <p>No study materials assigned yet.</p>
        )}
      </ul>
    </section>
  );
}
