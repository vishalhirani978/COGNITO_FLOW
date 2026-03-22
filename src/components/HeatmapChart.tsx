interface HeatmapChartProps {
  data: {
    topics: string[];
    years: number[];
    values: number[][];
    teachers?: string[];
  };
  mode: 'general' | 'teacher';
}

export default function HeatmapChart({ data, mode }: HeatmapChartProps) {
  const { topics, years, teachers, values } = data;
  const dimensions = mode === 'teacher' ? teachers || [] : years;

  const topicTotals = topics.map((topic, i) => ({
    topic,
    total: values[i].reduce((a, b) => a + b, 0)
  })).sort((a, b) => b.total - a.total);

  const sortedTopics = topicTotals.map(t => t.topic);
  const sortedValues = topicTotals.map((t) => values[topics.indexOf(t.topic)]);

  const maxValue = Math.max(...sortedValues.flat(), 1);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-50';
    const intensity = Math.min(value / maxValue, 1);
    if (intensity < 0.2) return 'bg-blue-200';
    if (intensity < 0.4) return 'bg-blue-400';
    if (intensity < 0.6) return 'bg-blue-600';
    if (intensity < 0.8) return 'bg-blue-700';
    return 'bg-blue-900';
  };

  const getTextColor = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    return intensity > 0.5 ? 'text-white' : 'text-slate-900';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Topic Importance Analysis</h3>
        
        <div className="space-y-3">
          {topicTotals.map(({ topic, total }) => (
            <div key={topic} className="flex items-center gap-4">
              <div className="w-40 text-sm font-medium text-slate-700 truncate" title={topic}>
                {topic}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-700 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((total / (topicTotals[0]?.total || 1)) * 100, 5)}%` }}
                />
              </div>
              <div className="w-16 text-sm text-slate-600 text-right">
                {total} marks
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {mode === 'teacher' ? 'Teacher-wise Analysis' : 'Year-wise Analysis'}
        </h3>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              <div className="grid" style={{ gridTemplateColumns: `180px repeat(${dimensions.length}, minmax(100px, 1fr))` }}>
                <div className="bg-slate-100 p-3 font-semibold text-slate-700 text-sm">
                  Topics
                </div>
                {dimensions.map((dim) => (
                  <div key={dim} className="bg-slate-100 p-3 font-semibold text-slate-700 text-sm text-center">
                    {dim}
                  </div>
                ))}
              </div>

              {sortedTopics.map((topic, rowIndex) => (
                <div
                  key={topic}
                  className="grid"
                  style={{ gridTemplateColumns: `180px repeat(${dimensions.length}, minmax(100px, 1fr))` }}
                >
                  <div className="bg-white p-3 text-sm text-slate-700 font-medium truncate">
                    {topic}
                  </div>
                  {sortedValues[rowIndex].map((value, colIndex) => (
                    <div
                      key={`${topic}-${dimensions[colIndex]}`}
                      className={`${getColor(value)} p-3 text-center transition-colors hover:opacity-80`}
                    >
                      <span className={`text-sm font-semibold ${getTextColor(value)}`}>
                        {value > 0 ? value : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <span className="text-sm text-slate-600">Less</span>
          <div className="flex space-x-1">
            <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded"></div>
            <div className="w-8 h-8 bg-blue-200 rounded"></div>
            <div className="w-8 h-8 bg-blue-400 rounded"></div>
            <div className="w-8 h-8 bg-blue-600 rounded"></div>
            <div className="w-8 h-8 bg-blue-700 rounded"></div>
            <div className="w-8 h-8 bg-blue-900 rounded"></div>
          </div>
          <span className="text-sm text-slate-600">More</span>
        </div>
      </div>
    </div>
  );
}
