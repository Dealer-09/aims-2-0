import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

<<<<<<< Updated upstream
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
=======
export default function StudyMaterials() {
  const { user, isLoaded } = useUser();
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (user?.emailAddresses[0].emailAddress) {
      fetch(`/api/getMaterials?email=${user.emailAddresses[0].emailAddress}`)
        .then((res) => res.json())
        .then((data) => setMaterials(data.materials));
    }
>>>>>>> Stashed changes
  }, [user]);

  if (!isLoaded) return <p>Loading...</p>;
  if (!user) return <p>Please log in to access study materials.</p>;

  return (
    <section>
      <h2>Your Study Materials</h2>
      <ul>
<<<<<<< Updated upstream
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
=======
        {materials.map((material) => (
          <li key={material.id}>
            <a href={material.link} download>{material.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
>>>>>>> Stashed changes
