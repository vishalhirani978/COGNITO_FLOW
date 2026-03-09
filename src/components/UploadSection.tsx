import { useState } from "react";
import { supabase } from "../lib/supabase";
console.log("UploadSection mounted");


interface UploadSectionProps {
  onPaperUploaded: () => void;
}

export default function UploadSection({ onPaperUploaded }: UploadSectionProps) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: new Date().getFullYear(),
    teacherName: "",
    fileContent: "",
  });

  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain") {
      setError("Please upload a .txt file only");
      return;
    }

    const content = await file.text();
    setFileName(file.name);
    setFormData({ ...formData, fileContent: content });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("BUTTON CLICKED");

    if (!formData.fileContent) {
      setError("Please upload a file");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.from("papers").insert([
      {
        title: formData.title,
        subject: formData.subject,
        year: formData.year,
        teacher_name: formData.teacherName,
        file_content: formData.fileContent,
      },
    ]);

    if (error) {
      console.error(error);
      setError("Database insert failed");
    } else {
      setSuccess("Paper uploaded successfully ✅");
      setFormData({
        title: "",
        subject: "",
        year: new Date().getFullYear(),
        teacherName: "",
        fileContent: "",
      });
      setFileName(null);
      onPaperUploaded();
    }

    setIsUploading(false);
  };

  return (
    <div className="p-4 border rounded-lg max-w-xl">
      <h2 className="text-xl font-bold mb-4">Upload Paper</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />

        <input
          type="text"
          placeholder="Subject"
          className="w-full border p-2 rounded"
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Year"
          className="w-full border p-2 rounded"
          value={formData.year}
          onChange={(e) =>
            setFormData({ ...formData, year: Number(e.target.value) })
          }
          required
        />

        <input
          type="text"
          placeholder="Teacher name (optional)"
          className="w-full border p-2 rounded"
          value={formData.teacherName}
          onChange={(e) =>
            setFormData({ ...formData, teacherName: e.target.value })
          }
        />

        <input type="file" accept=".txt" onChange={handleFileChange} />

        {fileName && <p className="text-sm">Selected: {fileName}</p>}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={isUploading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
