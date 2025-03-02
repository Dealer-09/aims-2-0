import { useState, FormEvent } from "react";

export default function UploadMaterials() {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
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
        <button type="submit">Upload</button>
      </form>
    </section>
  );
}