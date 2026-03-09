<<<<<<< HEAD
import { useState } from "react";
import { supabase } from "../lib/supabase";
console.log("UploadSection mounted");


interface UploadSectionProps {
  onPaperUploaded: () => void;
=======
import { useState } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { supabase, Paper } from '../lib/supabase';

interface UploadSectionProps {
  onPaperUploaded: (paper: Paper) => void;
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f
}

export default function UploadSection({ onPaperUploaded }: UploadSectionProps) {
  const [formData, setFormData] = useState({
<<<<<<< HEAD
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
=======
    title: '',
    subject: '',
    year: new Date().getFullYear(),
    teacherName: '',
    fileContent: '',
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      setError('Please upload a text file (.txt)');
      return;
    }

    setFileName(file.name);
    const content = await file.text();
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f
    setFormData({ ...formData, fileContent: content });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    console.log("BUTTON CLICKED");

    if (!formData.fileContent) {
      setError("Please upload a file");
=======

    if (!formData.fileContent) {
      setError('Please upload a file');
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f
      return;
    }

    setIsUploading(true);
    setError(null);
<<<<<<< HEAD
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
=======

    try {
      const { data, error: insertError } = await supabase
        .from('papers')
        .insert([
          {
            title: formData.title,
            subject: formData.subject,
            year: formData.year,
            teacher_name: formData.teacherName || null,
            file_content: formData.fileContent,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        onPaperUploaded(data);
        setFormData({
          title: '',
          subject: '',
          year: new Date().getFullYear(),
          teacherName: '',
          fileContent: '',
        });
        setFileName(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload paper');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Upload Exam Paper</h2>
        <p className="text-slate-600 text-sm">
          Upload past exam papers to analyze topic trends and patterns
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paper Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="e.g., Final Exam 2024"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="e.g., Data Structures & Algorithms"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              min="2000"
              max="2100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teacher Name (Optional)
            </label>
            <input
              type="text"
              value={formData.teacherName}
              onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="e.g., Mr. Atta"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {fileName ? (
                <div className="flex items-center justify-center space-x-2">
                  <File className="w-6 h-6 text-slate-600" />
                  <span className="text-slate-700">{fileName}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFileName(null);
                      setFormData({ ...formData, fileContent: '' });
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">Text files only (.txt)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f

        <button
          type="submit"
          disabled={isUploading}
<<<<<<< HEAD
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload"}
=======
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload Paper</span>
            </>
          )}
>>>>>>> 7af9858205e984256eab0740878de7c465a48c3f
        </button>
      </form>
    </div>
  );
}
