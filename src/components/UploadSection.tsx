import { useState } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { Paper } from '../App';

interface UploadSectionProps {
  onPaperUploaded: (paper: Omit<Paper, 'id' | 'uploaded_at'>) => void;
}

export default function UploadSection({ onPaperUploaded }: UploadSectionProps) {
  const [formData, setFormData] = useState({
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
    setFormData({ ...formData, fileContent: content });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fileContent) {
      setError('Please upload a file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onPaperUploaded({
        title: formData.title,
        subject: formData.subject,
        year: formData.year,
        teacher_name: formData.teacherName || null,
        file_content: formData.fileContent,
      });

      setFormData({
        title: '',
        subject: '',
        year: new Date().getFullYear(),
        teacherName: '',
        fileContent: '',
      });
      setFileName(null);
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

        <button
          type="submit"
          disabled={isUploading}
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
        </button>
      </form>
    </div>
  );
}
