import { useState } from "react";
import AnalysisDashboard from "./components/AnalysisDashboard";
import { Paper, ExamType } from "./types/paper";
import { extractTopics } from "./utils/paperExtractor";

/* ================= APP ================= */

type Mode = "upload" | "analysis";

export default function App() {
  const [mode, setMode] = useState<Mode>("upload");
  const [papers, setPapers] = useState<Paper[]>([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState<number>(2026);
  const [teacher, setTeacher] = useState("");
  const [examType, setExamType] = useState<ExamType>("Mid");

  /* ================= FILE ================= */

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        console.error("No text content from file");
        return;
      }

      try {
        // ✅ EXTRACT TOPICS FROM PAPER TEXT
        console.log("Extracting topics...");
        const extractedTopics = extractTopics(text);
        console.log("Extracted topics:", extractedTopics);

        const newPaper: Paper = {
          id: crypto.randomUUID(),
          title,
          subject,
          year,
          teacher,
          examType,
          fileName: file.name,
          topics: extractedTopics,
        };

        console.log("Adding paper:", newPaper);
        setPapers((prev) => {
          const updated = [...prev, newPaper];
          console.log("Papers updated:", updated);
          return updated;
        });

        setTitle("");
        setSubject("");
        setTeacher("");
        setExamType("Mid");
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file: " + (error instanceof Error ? error.message : String(error)));
      }
    };

    reader.readAsText(file);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ================= TOP BAR ================= */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <div className="flex gap-1 items-end h-5">
                <span className="w-1 h-2 bg-white rounded"></span>
                <span className="w-1 h-4 bg-white rounded"></span>
                <span className="w-1 h-3 bg-white rounded"></span>
              </div>
            </div>

            <div>
              <h1 className="text-xl font-bold leading-tight">
                CognitoFlow
              </h1>
              <p className="text-sm text-slate-500 leading-tight">
                AI-Powered Exam Analysis Platform
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setMode("upload")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "upload"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              Upload
            </button>

            <button
              onClick={() => setMode("analysis")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === "analysis"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              Analysis
            </button>
          </div>
        </div>
      </header>

      {/* ================= BODY ================= */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {mode === "upload" && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h2 className="text-2xl font-semibold">
                Upload Exam Paper
              </h2>
              <p className="text-slate-500 mt-1">
                Upload past exam papers to analyze topic trends and patterns
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <input
                  className="border rounded-lg px-4 py-2"
                  placeholder="Paper title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="border rounded-lg px-4 py-2"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <input
                  type="number"
                  className="border rounded-lg px-4 py-2"
                  value={year}
                  onChange={(e) =>
                    setYear(Number(e.target.value))
                  }
                />

                <input
                  className="border rounded-lg px-4 py-2"
                  placeholder="Teacher"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                />

                <select
                  className="border rounded-lg px-4 py-2"
                  value={examType}
                  onChange={(e) =>
                    setExamType(e.target.value as ExamType)
                  }
                >
                  <option>Mid</option>
                  <option>Final</option>
                  <option>Quiz</option>
                  <option>Other</option>
                </select>
              </div>

              <label className="mt-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer hover:border-slate-400 transition">
                <input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />

                <p className="mt-2 font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500">
                  Text files only (.txt)
                </p>
              </label>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4">
                Uploaded Papers ({papers.length})
              </h3>

              <div className="grid gap-4">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-white border rounded-xl p-5 flex justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {paper.title}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {paper.subject} • {paper.year} •{" "}
                        {paper.examType}
                      </p>
                      <p className="text-xs text-slate-400">
                        {paper.teacher || "—"} |{" "}
                        {paper.fileName}
                      </p>
                    </div>

                    <div className="text-sm font-medium text-slate-600">
                      {Object.keys(paper.topics).length} topics
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {mode === "analysis" && (
          <AnalysisDashboard papers={papers} />
        )}
      </main>
    </div>
  );
}
