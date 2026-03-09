import { useMemo, useState } from "react";
import { Paper, ExamType } from "../types/paper";
import { filterPapers, aggregateTopics } from "../utils/analysis";

type Props = {
  papers: Paper[];
};

export default function AnalysisDashboard({ papers }: Props) {
  const [subject, setSubject] = useState("All");
  const [teacher, setTeacher] = useState("All");
  const [examType, setExamType] = useState<ExamType | "All">("All");
  const [fromYear, setFromYear] = useState<number | "All">("All");
  const [toYear, setToYear] = useState<number | "All">("All");

  const subjects = ["All", ...new Set(papers.map((p) => p.subject))];
  const teachers = ["All", ...new Set(papers.map((p) => p.teacher).filter(Boolean))];
  const years = [...new Set(papers.map((p) => p.year))].sort();

  const filteredPapers = useMemo(() => {
    return filterPapers(papers, {
      subject: subject === "All" ? undefined : subject,
      teacher: teacher === "All" ? undefined : teacher,
      examType: examType === "All" ? undefined : examType,
      fromYear: fromYear === "All" ? undefined : fromYear,
      toYear: toYear === "All" ? undefined : toYear,
    });
  }, [papers, subject, teacher, examType, fromYear, toYear]);

  const combinedTopics = useMemo(() => {
    return aggregateTopics(filteredPapers);
  }, [filteredPapers]);

  const totalMarks = Object.values(combinedTopics).reduce((a, b) => a + b.marks, 0);
  const totalQuestions = Object.values(combinedTopics).reduce((a, b) => a + b.questions, 0);

  return (
    <div className="space-y-10">

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <select className="border rounded-lg px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select className="border rounded-lg px-3 py-2" value={teacher} onChange={(e) => setTeacher(e.target.value)}>
          {teachers.map((t) => <option key={t}>{t || "Unknown"}</option>)}
        </select>

        <select className="border rounded-lg px-3 py-2" value={examType} onChange={(e) => setExamType(e.target.value as any)}>
          <option>All</option>
          <option>Mid</option>
          <option>Final</option>
          <option>Quiz</option>
          <option>Other</option>
        </select>

        <select className="border rounded-lg px-3 py-2" value={fromYear} onChange={(e) => setFromYear(e.target.value === "All" ? "All" : Number(e.target.value))}>
          <option>All</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>

        <select className="border rounded-lg px-3 py-2" value={toYear} onChange={(e) => setToYear(e.target.value === "All" ? "All" : Number(e.target.value))}>
          <option>All</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <SummaryCard title="Papers Used" value={filteredPapers.length} />
        <SummaryCard title="Topics Found" value={Object.keys(combinedTopics).length} />
        <SummaryCard title="Total Questions" value={totalQuestions} />
        <SummaryCard title="Total Marks" value={totalMarks} />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="p-5 border-b font-semibold">Topic Breakdown</div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left px-5 py-3">Topic</th>
              <th className="px-5 py-3">Questions</th>
              <th className="px-5 py-3">Marks</th>
              <th className="px-5 py-3">% Weight</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(combinedTopics).map(([topic, data]) => {
              const weight = totalMarks ? ((data.marks / totalMarks) * 100).toFixed(1) : 0;

              return (
                <tr key={topic} className="border-t">
                  <td className="px-5 py-3 font-medium">{topic}</td>
                  <td className="text-center">{data.questions}</td>
                  <td className="text-center">{data.marks}</td>
                  <td className="text-center">{weight}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-2xl p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}
