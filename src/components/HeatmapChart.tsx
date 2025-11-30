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

  const maxValue = Math.max(...values.flat());
  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-50';
    const intensity = Math.min(value / maxValue, 1);
    if (intensity < 0.2) return 'bg-slate-200';
    if (intensity < 0.4) return 'bg-slate-300';
    if (intensity < 0.6) return 'bg-slate-400';
    if (intensity < 0.8) return 'bg-slate-600';
    return 'bg-slate-900';
  };

  const getTextColor = (value: number) => {
    const intensity = Math.min(value / maxValue, 1);
    return intensity > 0.5 ? 'text-white' : 'text-slate-900';
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${dimensions.length}, 120px)` }}>
            <div className="bg-slate-100 p-3 font-semibold text-slate-700 text-sm">
              Topics
            </div>
            {dimensions.map((dim) => (
              <div key={dim} className="bg-slate-100 p-3 font-semibold text-slate-700 text-sm text-center">
                {dim}
              </div>
            ))}
          </div>

          {topics.map((topic, rowIndex) => (
            <div
              key={topic}
              className="grid"
              style={{ gridTemplateColumns: `200px repeat(${dimensions.length}, 120px)` }}
            >
              <div className="bg-white p-3 text-sm text-slate-700 font-medium">
                {topic}
              </div>
              {values[rowIndex].map((value, colIndex) => (
                <div
                  key={`${topic}-${dimensions[colIndex]}`}
                  className={`${getColor(value)} p-3 text-center transition-colors hover:opacity-80 cursor-pointer`}
                  title={`${topic} (${dimensions[colIndex]}): ${value} marks`}
                >
                  <span className={`text-sm font-semibold ${getTextColor(value)}`}>
                    {value > 0 ? value : '-'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <span className="text-sm text-slate-600">Less</span>
          <div className="flex space-x-1">
            <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded"></div>
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
            <div className="w-8 h-8 bg-slate-300 rounded"></div>
            <div className="w-8 h-8 bg-slate-400 rounded"></div>
            <div className="w-8 h-8 bg-slate-600 rounded"></div>
            <div className="w-8 h-8 bg-slate-900 rounded"></div>
          </div>
          <span className="text-sm text-slate-600">More</span>
        </div>
      </div>
    </div>
  );
}
