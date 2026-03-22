import { useState, useEffect, useMemo } from 'react';
import { Loader2, TrendingUp, AlertTriangle, Target, BarChart3 } from 'lucide-react';
import { Paper } from '../App';

interface AnalysisViewProps {
  mode: 'general' | 'teacher';
  papers: Paper[];
}

interface TopicAnalysis {
  name: string;
  category: string;
  occurrences: number;
  totalMarks: number;
  importance: number;
  lastAppeared: number;
  years: number[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export default function AnalysisView({ papers }: AnalysisViewProps) {
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<string[]>([]);

  const topicKeywords: { keyword: string; patterns: string[]; category: string }[] = [
    // Sorting Algorithms
    { keyword: 'Sorting', category: 'Algorithm', patterns: ['sorting', 'bubble sort', 'quick sort', 'merge sort', 'insertion sort', 'selection sort', 'heap sort', 'radix sort', 'bucket sort', 'counting sort', 'shell sort', 'topological sort', 'external sorting'] },
    { keyword: 'Searching', category: 'Algorithm', patterns: ['searching', 'linear search', 'binary search', 'ternary search', 'interpolation search', 'exponential search'] },
    
    // Dynamic Programming
    { keyword: 'Dynamic Programming', category: 'Algorithm', patterns: ['dynamic programming', 'dp', 'optimal substructure', 'memoization', 'tabulation', 'lcs', 'longest common subsequence', 'knapsack', 'coin change', 'edit distance', 'matrix chain multiplication'] },
    { keyword: 'Greedy', category: 'Algorithm', patterns: ['greedy', 'greedy algorithm', 'optimal choice', 'huffman coding', 'activity selection', 'fractional knapsack', 'job sequencing'] },
    { keyword: 'Divide & Conquer', category: 'Algorithm', patterns: ['divide and conquer', 'divide & conquer', 'd&c', 'binary search', 'merge sort', 'quick sort', 'strassen matrix'] },
    { keyword: 'Backtracking', category: 'Algorithm', patterns: ['backtracking', 'state space', 'n-queens', 'sudoku', 'subset sum', 'permutations', 'combinations', 'graph coloring'] },
    
    // Graph Algorithms
    { keyword: 'Graph', category: 'Data Structure', patterns: ['graph', 'vertex', 'vertices', 'edge', 'edges', 'undirected', 'directed', 'adjacency', 'incidence'] },
    { keyword: 'BFS/DFS', category: 'Algorithm', patterns: ['bfs', 'dfs', 'breadth first', 'depth first', 'traversal', 'level order', 'preorder', 'inorder', 'postorder'] },
    { keyword: 'Shortest Path', category: 'Algorithm', patterns: ['shortest path', 'dijkstra', 'bellman ford', 'floyd warshall', 'spfa', 'a* algorithm', 'single source', 'all pairs'] },
    { keyword: 'MST', category: 'Algorithm', patterns: ['mst', 'minimum spanning tree', 'prim', 'kruskal', 'boruvka', 'spanning tree'] },
    { keyword: 'Network Flow', category: 'Algorithm', patterns: ['network flow', 'max flow', 'min cut', 'ford fulkerson', 'edmonds karp', 'flow network', 'residual graph'] },
    
    // Tree Data Structures
    { keyword: 'Trees', category: 'Data Structure', patterns: ['tree', 'binary tree', 'rooted tree', 'forest', 'ordered tree', 'plane tree'] },
    { keyword: 'Binary Tree', category: 'Data Structure', patterns: ['binary tree', 'full binary tree', 'complete binary tree', 'perfect binary tree', 'balanced tree'] },
    { keyword: 'BST', category: 'Data Structure', patterns: ['bst', 'binary search tree', 'search tree', 'balanced search tree'] },
    { keyword: 'AVL Tree', category: 'Data Structure', patterns: ['avl', 'avl tree', 'rotation', 'balance factor', 'left rotation', 'right rotation', 'self balancing'] },
    { keyword: 'B-Tree', category: 'Data Structure', patterns: ['b-tree', 'b tree', 'b+ tree', 'b* tree', 'multiway tree', 'btree'] },
    { keyword: 'Trie', category: 'Data Structure', patterns: ['trie', 'prefix tree', 'digital tree', 'radix tree'] },
    { keyword: 'Segment Tree', category: 'Data Structure', patterns: ['segment tree', 'range tree', 'fenwick tree', 'binary indexed tree', 'bit'] },
    
    // Linear Data Structures
    { keyword: 'Linked List', category: 'Data Structure', patterns: ['linked list', 'singly linked', 'doubly linked', 'circular linked', 'node', 'pointer', 'next', 'prev', 'head', 'tail'] },
    { keyword: 'Arrays', category: 'Data Structure', patterns: ['array', '2d array', 'matrix', '1d array', 'multi-dimensional', 'jagged array', 'sparse matrix'] },
    { keyword: 'Stacks & Queues', category: 'Data Structure', patterns: ['stack', 'queue', 'lifo', 'fifo', 'push', 'pop', 'enqueue', 'dequeue', 'peep', 'front', 'rear', 'priority queue', 'deque'] },
    { keyword: 'Heaps', category: 'Data Structure', patterns: ['heap', 'min heap', 'max heap', 'priority queue', 'heapify', 'binary heap', 'fibonacci heap', 'd-ary heap'] },
    
    // Hashing
    { keyword: 'Hashing', category: 'Data Structure', patterns: ['hash', 'hashing', 'hash table', 'hash map', 'hash function', 'collision', 'chaining', 'open addressing', 'linear probing', 'quadratic probing', 'double hashing', 'rehashing', 'load factor'] },
    
    // String Algorithms
    { keyword: 'String Algorithms', category: 'Algorithm', patterns: ['string', 'palindrome', 'substring', 'pattern matching', 'anagram', 'trie', 'kmp', 'rabin karp', 'boyre moore', 'z-algorithm', 'suffix array', 'lexicographic'] },
    
    // Algorithm Design
    { keyword: 'Recursion', category: 'Algorithm', patterns: ['recursion', 'recursive', 'base case', 'recursive call', 'recursive function', 'recursion tree'] },
    { keyword: 'Complexity Analysis', category: 'Theory', patterns: ['time complexity', 'space complexity', 'big o', 'omega', 'theta', 'asymptotic', 'worst case', 'best case', 'average case', 'complexity'] },
    { keyword: 'Algorithm Paradigms', category: 'Theory', patterns: ['algorithm', 'pseudocode', 'flowchart', 'brute force', 'incremental', 'divide and conquer', 'transform and conquer', 'space time tradeoff'] },
    
    // Data Structure Theory
    { keyword: 'Data Structures', category: 'Theory', patterns: ['data structure', 'adt', 'abstract data type', 'linear', 'non-linear', 'primitive', 'non-primitive', 'static', 'dynamic'] },
    { keyword: 'ADT', category: 'Theory', patterns: ['abstract data type', 'adt', 'interface', 'implementation', 'specification'] },
    
    // Other Important Topics
    { keyword: 'Matrix Operations', category: 'Math', patterns: ['matrix', 'matrices', 'determinant', 'transpose', 'sparse matrix', 'matrix multiplication', 'strassen'] },
    { keyword: 'Bit Manipulation', category: 'Programming', patterns: ['bit', 'bitwise', 'mask', 'shift', 'xor', 'and', 'or', 'bit manipulation', 'set bits'] },
    { keyword: 'Disjoint Set', category: 'Data Structure', patterns: ['disjoint set', 'union find', 'dsu', 'make set', 'union', 'find', 'path compression', 'rank'] },
    { keyword: 'Sorting Analysis', category: 'Theory', patterns: ['sorting algorithm', 'comparison sort', 'stable sort', 'in-place sorting', 'external sort', 'time complexity of sorting'] },
    { keyword: 'Graph Traversal', category: 'Algorithm', patterns: ['graph traversal', 'graph visit', 'connected components', 'strongly connected', 'articulation point', 'bridge', 'topological sort'] },
    { keyword: 'Tree Traversal', category: 'Algorithm', patterns: ['tree traversal', 'preorder', 'inorder', 'postorder', 'level order', ' Morris traversal'] },
    { keyword: 'Counting Techniques', category: 'Math', patterns: ['permutation', 'combination', 'pigeonhole', 'inclusion exclusion', 'counting', 'factorial', 'ncr', 'npr'] },
    { keyword: 'Probability', category: 'Math', patterns: ['probability', 'expected', 'random', 'randomized algorithm', 'monte carlo', 'las vegas'] },
  ];

  const extractTopics = (content: string): Map<string, number> => {
    const topics = new Map<string, number>();
    const lowerContent = content.toLowerCase();

    for (const topic of topicKeywords) {
      let count = 0;
      let marks = 0;
      
      for (const pattern of topic.patterns) {
        const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
          count += matches.length;
        }
      }

      const marksRegex = new RegExp(`(${topic.keyword.toLowerCase()}|${topic.patterns[0]})[^.]*?(\\d+)\\s*marks?`, 'gi');
      let marksMatch;
      while ((marksMatch = marksRegex.exec(content)) !== null) {
        marks += parseInt(marksMatch[2]) || 0;
      }

      const importance = marks > 0 ? marks : count * 5;
      
      if (count > 0) {
        if (topics.has(topic.keyword)) {
          topics.set(topic.keyword, topics.get(topic.keyword)! + importance);
        } else {
          topics.set(topic.keyword, importance);
        }
      }
    }

    if (topics.size === 0) {
      const wordCount = content.split(/\s+/).length;
      topics.set('General Topics', Math.min(wordCount, 50));
    }

    return new Map([...topics.entries()].sort((a, b) => b[1] - a[1]));
  };

  const analyzeTopics = useMemo((): TopicAnalysis[] => {
    const filteredPapers = selectedSubject 
      ? papers.filter(p => p.subject === selectedSubject)
      : papers;

    if (filteredPapers.length === 0) return [];

    const topicMap = new Map<string, TopicAnalysis>();

    const sortedPapers = [...filteredPapers].sort((a, b) => a.year - b.year);

    for (const paper of sortedPapers) {
      const topics = extractTopics(paper.file_content);
      
      for (const [topicName, marks] of topics) {
        if (!topicMap.has(topicName)) {
          const topicInfo = topicKeywords.find(t => t.keyword === topicName);
          topicMap.set(topicName, {
            name: topicName,
            category: topicInfo?.category || 'General',
            occurrences: 0,
            totalMarks: 0,
            importance: 0,
            lastAppeared: paper.year,
            years: [],
            trend: 'stable'
          });
        }
        
        const analysis = topicMap.get(topicName)!;
        analysis.occurrences += 1;
        analysis.totalMarks += marks;
        analysis.lastAppeared = paper.year;
        if (!analysis.years.includes(paper.year)) {
          analysis.years.push(paper.year);
        }
      }
    }

    const maxOccurrences = Math.max(...Array.from(topicMap.values()).map(t => t.occurrences));
    const maxMarks = Math.max(...Array.from(topicMap.values()).map(t => t.totalMarks));

    const results: TopicAnalysis[] = [];
    topicMap.forEach((analysis) => {
      analysis.importance = Math.round(
        (analysis.occurrences / maxOccurrences) * 50 + 
        (analysis.totalMarks / maxMarks) * 50
      );

      if (analysis.years.length >= 2) {
        const recentYears = analysis.years.slice(-2);
        const olderYears = analysis.years.slice(0, -2);
        if (recentYears.length > olderYears.length) {
          analysis.trend = 'increasing';
        } else if (recentYears.length < olderYears.length) {
          analysis.trend = 'decreasing';
        }
      }
      
      results.push(analysis);
    });

    return results.sort((a, b) => b.importance - a.importance);
  }, [papers, selectedSubject]);

  useEffect(() => {
    const uniqueSubjects = Array.from(new Set(papers.map((p) => p.subject))).filter(Boolean);
    setSubjects(uniqueSubjects);
    if (uniqueSubjects.length > 0 && !uniqueSubjects.includes(selectedSubject)) {
      setSelectedSubject(uniqueSubjects[0]);
    }
    setTimeout(() => setLoading(false), 300);
  }, [papers]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <p className="text-slate-500">No papers uploaded yet.</p>
        <p className="text-sm mt-2">Upload papers to see analysis.</p>
      </div>
    );
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-100';
      case 'decreasing': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getPredictionScore = (topic: TopicAnalysis) => {
    const currentYear = new Date().getFullYear();
    const yearsSinceLast = currentYear - topic.lastAppeared;
    const frequencyScore = topic.occurrences / papers.length;
    const recencyScore = Math.max(0, 1 - (yearsSinceLast / 5));
    const importanceScore = topic.importance / 100;
    
    return Math.round((frequencyScore * 0.4 + recencyScore * 0.3 + importanceScore * 0.3) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Topic Analysis & Prediction</h2>
          </div>
          {subjects.length > 0 && (
            <div className="flex items-center space-x-3">
              <label className="text-sm text-slate-600">Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">{analyzeTopics.length}</div>
            <div className="text-sm text-blue-600">Total Topics</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {analyzeTopics.filter(t => t.trend === 'increasing').length}
            </div>
            <div className="text-sm text-green-600">Increasing Trend</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">
              {analyzeTopics.filter(t => t.occurrences > 1).length}
            </div>
            <div className="text-sm text-purple-600">Repeated Topics</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-700">{papers.length}</div>
            <div className="text-sm text-orange-600">Papers Analyzed</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Likely to Appear in Next Exam</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">Based on repetition patterns and topic importance</p>
        
        <div className="space-y-3">
          {analyzeTopics.slice(0, 8).map((topic, index) => {
            const score = getPredictionScore(topic);
            return (
              <div key={topic.name} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{topic.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTrendColor(topic.trend)}`}>
                      {topic.trend}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Repeated {topic.occurrences} times • {topic.totalMarks} total marks • Last: {topic.lastAppeared}
                  </div>
                </div>
                <div className="w-24">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${score > 70 ? 'bg-green-500' : score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">All Topics by Importance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Topic</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Occurrences</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Total Marks</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Years</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Trend</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Importance</th>
              </tr>
            </thead>
            <tbody>
              {analyzeTopics.map((topic) => (
                <tr key={topic.name} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{topic.name}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{topic.occurrences}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{topic.totalMarks}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{topic.years.join(', ')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(topic.trend)}`}>
                      {topic.trend}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${topic.importance}%` }} />
                      </div>
                      <span className="text-sm">{topic.importance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">Complete Topic Prediction Table</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">Probability of each topic appearing in upcoming exams based on historical data</p>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Topic Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Category</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Paper Count</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Frequency</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Last Year</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Trend</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Likelihood %</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Prediction</th>
              </tr>
            </thead>
            <tbody>
              {analyzeTopics.map((topic, index) => {
                const score = getPredictionScore(topic);
                const frequency = ((topic.occurrences / papers.length) * 100).toFixed(1);
                const getLikelihoodLabel = (score: number) => {
                  if (score >= 75) return { label: 'Very Likely', color: 'bg-green-600' };
                  if (score >= 50) return { label: 'Likely', color: 'bg-green-400' };
                  if (score >= 25) return { label: 'Possible', color: 'bg-yellow-500' };
                  return { label: 'Unlikely', color: 'bg-red-400' };
                };
                const likelihood = getLikelihoodLabel(score);
                return (
                  <tr key={topic.name} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 text-center font-medium text-slate-900">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{topic.name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        topic.category === 'Algorithm' ? 'bg-purple-100 text-purple-700' :
                        topic.category === 'Data Structure' ? 'bg-blue-100 text-blue-700' :
                        topic.category === 'Theory' ? 'bg-green-100 text-green-700' :
                        topic.category === 'Math' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {topic.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">{topic.occurrences} / {papers.length}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{frequency}%</td>
                    <td className="py-3 px-4 text-center text-slate-600">{topic.lastAppeared}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTrendColor(topic.trend)}`}>
                        {topic.trend}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${likelihood.color}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10">{score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full text-white ${likelihood.color}`}>
                        {likelihood.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-slate-900">Topic Repetition Analysis</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Most Repeated</h4>
            {analyzeTopics.filter(t => t.occurrences > 1).slice(0, 3).map(t => (
              <div key={t.name} className="flex justify-between text-sm py-1">
                <span className="text-slate-600">{t.name}</span>
                <span className="font-medium">{t.occurrences}x</span>
              </div>
            ))}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">High Marks Topics</h4>
            {[...analyzeTopics].sort((a, b) => b.totalMarks - a.totalMarks).slice(0, 3).map(t => (
              <div key={t.name} className="flex justify-between text-sm py-1">
                <span className="text-slate-600">{t.name}</span>
                <span className="font-medium">{t.totalMarks} marks</span>
              </div>
            ))}
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Recently Added</h4>
            {[...analyzeTopics].sort((a, b) => b.lastAppeared - a.lastAppeared).slice(0, 3).map(t => (
              <div key={t.name} className="flex justify-between text-sm py-1">
                <span className="text-slate-600">{t.name}</span>
                <span className="font-medium">{t.lastAppeared}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
