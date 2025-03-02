<<<<<<< Updated upstream
import { useState, useEffect, ChangeEvent } from "react";

interface Student {
  email: string;
}

interface Material {
  id: string;
  title: string;
}

export default function AssignMaterials() {
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
=======
import { useState, useEffect } from "react";

export default function AssignMaterials() {
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
>>>>>>> Stashed changes
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");

  useEffect(() => {
<<<<<<< Updated upstream
    const fetchData = async () => {
      try {
        const studentsRes = await fetch("/api/get-students");
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students);

        const materialsRes = await fetch("/api/get-all-materials");
        const materialsData = await materialsRes.json();
        setMaterials(materialsData.materials);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    try {
      const response = await fetch("/api/assign-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedStudent, material: selectedMaterial }),
      });
      if (!response.ok) throw new Error("Assignment failed");
      // Optionally reset selections or show success message
      setSelectedStudent("");
      setSelectedMaterial("");
    } catch (error) {
      console.error("Error assigning material:", error);
    }
  };

  const handleStudentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudent(e.target.value);
  };

  const handleMaterialChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMaterial(e.target.value);
=======
    fetch("/api/get-students").then((res) => res.json()).then((data) => setStudents(data.students));
    fetch("/api/get-all-materials").then((res) => res.json()).then((data) => setMaterials(data.materials));
  }, []);

  const handleAssign = async () => {
    await fetch("/api/assign-material", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedStudent, material: selectedMaterial }),
    });
>>>>>>> Stashed changes
  };

  return (
    <section>
      <h2>Assign Study Materials</h2>
<<<<<<< Updated upstream
      <select value={selectedStudent} onChange={handleStudentChange}>
        <option value="">Select Student</option>
        {students.map((student) => (
          <option key={student.email} value={student.email}>
            {student.email}
          </option>
        ))}
      </select>
      <select value={selectedMaterial} onChange={handleMaterialChange}>
        <option value="">Select Material</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.title}
          </option>
=======
      <select onChange={(e) => setSelectedStudent(e.target.value)}>
        <option value="">Select Student</option>
        {students.map((student) => (
          <option key={student.email} value={student.email}>{student.email}</option>
        ))}
      </select>
      <select onChange={(e) => setSelectedMaterial(e.target.value)}>
        <option value="">Select Material</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>{material.title}</option>
>>>>>>> Stashed changes
        ))}
      </select>
      <button onClick={handleAssign}>Assign</button>
    </section>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
