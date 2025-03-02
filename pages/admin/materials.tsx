<<<<<<< Updated upstream
import { useState, FormEvent } from "react";
=======
import { useState } from "react";
>>>>>>> Stashed changes

export default function UploadMaterials() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

<<<<<<< Updated upstream
  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
=======
  const handleUpload = async (e) => {
>>>>>>> Stashed changes
    e.preventDefault();
    await fetch("/api/upload-material", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, link }),
    });
    setTitle("");
    setLink("");
  };

  return (
    <section>
      <h2>Upload Study Materials</h2>
      <form onSubmit={handleUpload}>
<<<<<<< Updated upstream
        <input 
          type="text" 
          placeholder="Material Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <input 
          type="url" 
          placeholder="File Link" 
          value={link} 
          onChange={(e) => setLink(e.target.value)} 
          required 
        />
=======
        <input type="text" placeholder="Material Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="url" placeholder="File Link" value={link} onChange={(e) => setLink(e.target.value)} required />
>>>>>>> Stashed changes
        <button type="submit">Upload</button>
      </form>
    </section>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
