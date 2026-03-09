import { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeatmapChart from './HeatmapChart';

interface AnalysisViewProps {
  mode: 'general' | 'teacher';
}

interface HeatmapData {
  topics: string[];
  years: number[];
  values: number[][];
  teachers?: string[];
}

export default function AnalysisView({ mode }: AnalysisViewProps) {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadAnalysisData();
    }
  }, [selectedSubject, mode]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('papers')
        .select('subject')
        .order('subject');

      if (error) throw error;

      const uniqueSubjects = Array.from(
        new Set(data?.map((p) => p.subject) || [])
      );
      setSubjects(uniqueSubjects);
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      const { data: papers, error: papersError } = await supabase
        .from('papers')
        .select('id, year, teacher_name, file_content')
        .eq('subject', selectedSubject)
        .order('year');

      if (papersError) throw papersError;

      if (!papers || papers.length === 0) {
        setHeatmapData(null);
        setLoading(false);
        return;
      }

      const topicsMap = new Map<string, Map<number | string, number>>();
      const yearsSet = new Set<number>();
      const teachersSet = new Set<string>();

      for (const paper of papers) {
        const topics = extractTopics(paper.file_content);
        const key = mode === 'teacher' && paper.teacher_name
          ? paper.teacher_name
          : paper.year;

        if (mode === 'teacher' && paper.teacher_name) {
          teachersSet.add(paper.teacher_name);
        } else {
          yearsSet.add(paper.year);
        }

        for (const [topic, marks] of topics) {
          if (!topicsMap.has(topic)) {
            topicsMap.set(topic, new Map());
          }
          const current = topicsMap.get(topic)!.get(key) || 0;
          topicsMap.get(topic)!.set(key, current + marks);
        }
      }

      const topics = Array.from(topicsMap.keys()).slice(0, 10);
      const dimensions = mode === 'teacher'
        ? Array.from(teachersSet).sort()
        : Array.from(yearsSet).sort();

      const values = topics.map(topic => {
        return dimensions.map(dim => topicsMap.get(topic)?.get(dim) || 0);
      });

      setHeatmapData({
        topics,
        years: mode === 'general' ? dimensions as number[] : [],
        teachers: mode === 'teacher' ? dimensions as string[] : undefined,
        values,
      });
    } catch (err) {
      console.error('Error loading analysis data:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractTopics = (content: string): Map<string, number> => {
    const topics = new Map<string, number>();
    const lines = content.split('\n');

    const topicKeywords = [
      'Dynamic Programming',
      'Recursion',
      'Sorting Algorithms',
      'Graph Algorithms',
      'Trees',
      'Linked Lists',
      'Arrays',
      'Hashing',
      'Greedy Algorithms',
      'Divide and Conquer',
      'Backtracking',
      'String Algorithms',
      'Binary Search',
      'Stacks and Queues',
      'Heaps',
    ];

    for (const line of lines) {
      for (const keyword of topicKeywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          const marksMatch = line.match(/\((\d+)\s*marks?\)/i);
          const marks = marksMatch ? parseInt(marksMatch[1]) : 5;
          const current = topics.get(keyword) || 0;
          topics.set(keyword, current + marks);
        }
      }
    }

    return topics;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'teacher' ? 'Teacher Comparison' : 'Topic Trends'}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-sm text-slate-600">Subject:</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {heatmapData && heatmapData.topics.length > 0 ? (
          <HeatmapChart data={heatmapData} mode={mode} />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>No data available for analysis.</p>
            <p className="text-sm mt-2">Upload papers to see insights.</p>
          </div>
        )}
      </div>
    </div>
  );
}
