import { useState } from 'react';
import { Upload, BarChart3, Users, FileText } from 'lucide-react';
import UploadSection from './components/UploadSection';
import AnalysisView from './components/AnalysisView';

export interface Paper {
  id: string;
  title: string;
  subject: string;
  year: number;
  teacher_name: string | null;
  file_content: string;
  uploaded_at: string;
}

function App() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'analysis'>('upload');
  const [analysisMode, setAnalysisMode] = useState<'general' | 'teacher'>('general');

  const handlePaperUploaded = (paperData: Omit<Paper, 'id' | 'uploaded_at'>) => {
    const newPaper: Paper = {
      ...paperData,
      id: crypto.randomUUID(),
      uploaded_at: new Date().toISOString(),
    };
    setPapers([...papers, newPaper]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CognitoFlow</h1>
                <p className="text-sm text-slate-600">AI-Powered Exam Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('upload')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeView === 'upload'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setActiveView('analysis')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  activeView === 'analysis'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'upload' ? (
          <UploadSection onPaperUploaded={handlePaperUploaded} />
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span className="text-slate-700 font-medium">
                    {papers.length} papers uploaded
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">Analysis Mode:</span>
                  <button
                    onClick={() => setAnalysisMode('general')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      analysisMode === 'general'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    General
                  </button>
                  <button
                    onClick={() => setAnalysisMode('teacher')}
                    className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors ${
                      analysisMode === 'teacher'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Teacher Comparison</span>
                  </button>
                </div>
              </div>
            </div>
            <AnalysisView mode={analysisMode} papers={papers} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
