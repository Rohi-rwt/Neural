import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, RotateCcw, Shuffle, Pause } from 'lucide-react';
import { Tabs } from '@/components/common/UI';

const VIZ_TABS = [
  { id: 'sorting', label: 'Sorting' },
  { id: 'tree', label: 'Binary Tree' },
  { id: 'graph', label: 'Graphs' },
  { id: 'stack', label: 'Stack/Queue' }
];

const ALGORITHMS = {
  sorting: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'],
  tree: ['Inorder', 'Preorder', 'Postorder', 'BFS Level Order'],
  graph: ['BFS', 'DFS', 'Dijkstra\'s', 'Topological Sort'],
  stack: ['Stack Push/Pop', 'Queue Enqueue/Dequeue', 'Monotonic Stack']
};

const COMPLEXITY = {
  'Bubble Sort': { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
  'Selection Sort': { best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: false },
  'Insertion Sort': { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: true },
  'Merge Sort': { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: true },
  'Quick Sort': { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: false }
};

function SortingVisualizer() {
  const [arr, setArr] = useState([64, 34, 25, 12, 22, 11, 90, 45, 55, 30]);
  const [algo, setAlgo] = useState('Bubble Sort');
  const [speed, setSpeed] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [comparing, setComparing] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [step, setStep] = useState('');
  const abortRef = useRef(false);

  const delay = () => new Promise(r => setTimeout(r, (11 - speed) * 60));

  const randomize = () => {
    abortRef.current = true;
    setIsRunning(false);
    setSorted([]);
    setComparing([]);
    setStep('');
    setTimeout(() => {
      setArr(Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10));
      abortRef.current = false;
    }, 50);
  };

  const reset = () => {
    abortRef.current = true;
    setIsRunning(false);
    setSorted([]);
    setComparing([]);
    setStep('');
    setTimeout(() => {
      setArr([64, 34, 25, 12, 22, 11, 90, 45, 55, 30]);
      abortRef.current = false;
    }, 50);
  };

  const bubbleSort = async (a) => {
    const arr = [...a];
    const sortedIdxs = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (abortRef.current) return;
        setComparing([j, j + 1]);
        setStep(`Comparing ${arr[j]} and ${arr[j+1]}...`);
        await delay();
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArr([...arr]);
          setStep(`Swapped ${arr[j]} ↔ ${arr[j+1]}`);
          await delay();
        }
      }
      sortedIdxs.push(arr.length - 1 - i);
      setSorted([...sortedIdxs]);
    }
    setComparing([]);
    setStep('✅ Sorting complete!');
  };

  const selectionSort = async (a) => {
    const arr = [...a];
    const sortedIdxs = [];
    for (let i = 0; i < arr.length; i++) {
      if (abortRef.current) return;
      let minIdx = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (abortRef.current) return;
        setComparing([minIdx, j]);
        setStep(`Finding minimum in range [${i}, ${arr.length-1}]...`);
        await delay();
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArr([...arr]);
        await delay();
      }
      sortedIdxs.push(i);
      setSorted([...sortedIdxs]);
    }
    setComparing([]);
    setStep('✅ Sorting complete!');
  };

  const insertionSort = async (a) => {
    const arr = [...a];
    const sortedIdxs = [0];
    for (let i = 1; i < arr.length; i++) {
      if (abortRef.current) return;
      const key = arr[i];
      let j = i - 1;
      setStep(`Inserting ${key} into sorted portion...`);
      while (j >= 0 && arr[j] > key) {
        if (abortRef.current) return;
        setComparing([j, j + 1]);
        arr[j + 1] = arr[j];
        setArr([...arr]);
        await delay();
        j--;
      }
      arr[j + 1] = key;
      setArr([...arr]);
      sortedIdxs.push(i);
      setSorted([...sortedIdxs]);
    }
    setComparing([]);
    setSorted(arr.map((_, i) => i));
    setStep('✅ Sorting complete!');
  };

  const animate = async () => {
    if (isRunning) { abortRef.current = true; setIsRunning(false); return; }
    abortRef.current = false;
    setIsRunning(true);
    setSorted([]);
    setComparing([]);

    const fn = { 'Bubble Sort': bubbleSort, 'Selection Sort': selectionSort, 'Insertion Sort': insertionSort };
    if (fn[algo]) await fn[algo](arr);
    else setStep(`${algo} visualization coming soon!`);
    setIsRunning(false);
    setComparing([]);
  };

  const max = Math.max(...arr);
  const cx = COMPLEXITY[algo];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            className="input h-9 w-44"
            value={algo}
            onChange={e => { setAlgo(e.target.value); reset(); }}
          >
            {ALGORITHMS.sorting.map(a => <option key={a}>{a}</option>)}
          </select>
          <div className="flex items-center gap-2 text-xs text-secondary">
            Speed:
            <input type="range" min="1" max="10" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-20 accent-accent" />
            <span className="text-accent font-medium">{speed}x</span>
          </div>
          <div className="flex gap-2 ml-auto">
            <button onClick={animate} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isRunning ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'btn-primary'}`}>
              {isRunning ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Animate</>}
            </button>
            <button onClick={reset} className="btn-outline text-xs py-1.5"><RotateCcw size={12} /></button>
            <button onClick={randomize} className="btn-outline text-xs py-1.5"><Shuffle size={12} /> Random</button>
          </div>
        </div>

        {/* Array bars */}
        <div className="bg-surface border border-surface rounded-xl h-52 flex items-end gap-1 px-4 pb-4 pt-6">
          {arr.map((v, i) => {
            const isSorted = sorted.includes(i);
            const isComparing = comparing.includes(i);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-sm transition-all duration-200 relative flex items-center justify-center ${
                    isSorted ? 'bg-emerald-500' : isComparing ? 'bg-amber-400' : 'bg-accent'
                  }`}
                  style={{ height: `${Math.round((v / max) * 160) + 8}px` }}
                >
                  <span className="text-white text-[9px] font-bold absolute -top-4">{v}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          {[{c:'bg-accent',l:'Unsorted'},{c:'bg-amber-400',l:'Comparing'},{c:'bg-emerald-500',l:'Sorted'}].map(l => (
            <div key={l.l} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${l.c}`} />{l.l}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Complexity */}
        {cx && (
          <div className="card">
            <div className="text-sm font-semibold mb-3">📊 Complexity — {algo}</div>
            <div className="space-y-2">
              {[{l:'Best Case',v:cx.best},{l:'Average Case',v:cx.avg},{l:'Worst Case',v:cx.worst},{l:'Space',v:cx.space}].map(c => (
                <div key={c.l} className="flex justify-between py-2 border-b border-surface text-sm">
                  <span className="text-muted">{c.l}</span>
                  <span className="text-accent font-mono font-semibold">{c.v}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted">Stable Sort</span>
                <span className={cx.stable ? 'text-emerald-400' : 'text-red-400'}>{cx.stable ? '✓ Yes' : '✗ No'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step explanation */}
        <div className="card">
          <div className="text-sm font-semibold mb-3">📝 Live Steps</div>
          <div className={`text-sm p-3 bg-surface3 rounded-xl min-h-[80px] flex items-center ${step ? 'text-primary' : 'text-muted'}`}>
            {step || 'Click ▶ Animate to see step-by-step visualization with each comparison and swap highlighted in real-time.'}
          </div>
          <div className="mt-3 text-xs text-muted">
            <strong className="text-secondary">How {algo} works:</strong><br />
            {algo === 'Bubble Sort' && 'Repeatedly swap adjacent elements if they are in wrong order. Largest element "bubbles up" to its correct position each pass.'}
            {algo === 'Selection Sort' && 'Find minimum in unsorted portion and place it at the beginning. Divides array into sorted and unsorted portions.'}
            {algo === 'Insertion Sort' && 'Build sorted array one element at a time. Pick each element and insert it into its correct position in the sorted portion.'}
            {algo === 'Merge Sort' && 'Divide array in half recursively, then merge sorted halves. Guaranteed O(n log n) — best for linked lists.'}
            {algo === 'Quick Sort' && 'Choose a pivot, partition elements around it, recursively sort partitions. Average O(n log n) but O(n²) worst case.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const tree = { val: 1, left: { val: 2, left: { val: 4, left: null, right: null }, right: { val: 5, left: null, right: null } }, right: { val: 3, left: { val: 6, left: null, right: null }, right: { val: 7, left: null, right: null } } };

    function drawNode(node, x, y, gap) {
      if (!node) return;
      ctx.fillStyle = '#6c63ff';
      ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(node.val, x, y);

      if (node.left) {
        ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 14, y + 14); ctx.lineTo(x - gap + 14, y + 70 - 14); ctx.stroke();
        drawNode(node.left, x - gap, y + 70, gap / 2);
      }
      if (node.right) {
        ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 14, y + 14); ctx.lineTo(x + gap - 14, y + 70 - 14); ctx.stroke();
        drawNode(node.right, x + gap, y + 70, gap / 2);
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1a1d26';
    ctx.fillRect(0, 0, W, H);
    drawNode(tree, W / 2, 40, 120);
  }, []);

  return (
    <div className="card">
      <div className="text-sm font-semibold mb-3">🌳 Binary Tree Visualization</div>
      <canvas ref={canvasRef} width={600} height={280} className="w-full rounded-lg border border-surface" />
      <p className="text-xs text-muted mt-3">Tree traversal animations — BFS, DFS (Inorder/Preorder/Postorder) — click to run</p>
    </div>
  );
}

function StackQueueViz() {
  const [stack, setStack] = useState([3, 7, 1, 9]);
  const [queue, setQueue] = useState([5, 2, 8, 4]);
  const [input, setInput] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Stack */}
      <div className="card">
        <div className="text-sm font-semibold mb-3">📚 Stack (LIFO)</div>
        <div className="flex flex-col gap-1 mb-4 min-h-32">
          {stack.slice().reverse().map((v, i) => (
            <div key={i} className={`px-4 py-2.5 rounded-lg text-sm font-mono font-medium text-center transition-all ${i === 0 ? 'bg-accent text-white' : 'bg-surface3 text-secondary'}`}>
              {v} {i === 0 && <span className="text-xs ml-2 opacity-70">← TOP</span>}
            </div>
          ))}
          {stack.length === 0 && <div className="text-center text-muted py-6 text-sm">Stack is empty</div>}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1 h-9" placeholder="Value" value={input} onChange={e => setInput(e.target.value)} type="number" />
          <button onClick={() => { if (input) { setStack(s => [...s, +input]); setInput(''); } }} className="btn-primary text-xs py-1.5">Push</button>
          <button onClick={() => setStack(s => s.slice(0, -1))} disabled={!stack.length} className="btn-outline text-xs py-1.5 disabled:opacity-40">Pop</button>
        </div>
      </div>

      {/* Queue */}
      <div className="card">
        <div className="text-sm font-semibold mb-3">🔁 Queue (FIFO)</div>
        <div className="flex gap-1 mb-4 flex-wrap min-h-12">
          {queue.map((v, i) => (
            <div key={i} className={`px-4 py-2.5 rounded-lg text-sm font-mono font-medium flex-1 text-center ${i === 0 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : i === queue.length - 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface3 text-secondary'}`}>
              {v}
              {i === 0 && <div className="text-[9px] text-cyan-400 mt-0.5">FRONT</div>}
              {i === queue.length - 1 && i !== 0 && <div className="text-[9px] text-emerald-400 mt-0.5">REAR</div>}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input flex-1 h-9" placeholder="Value" value={input} onChange={e => setInput(e.target.value)} type="number" />
          <button onClick={() => { if (input) { setQueue(q => [...q, +input]); setInput(''); } }} className="btn-primary text-xs py-1.5">Enqueue</button>
          <button onClick={() => setQueue(q => q.slice(1))} disabled={!queue.length} className="btn-outline text-xs py-1.5 disabled:opacity-40">Dequeue</button>
        </div>
      </div>
    </div>
  );
}

export default function DSAVisualizer() {
  const [tab, setTab] = useState('sorting');

  return (
    <div className="p-6 fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold">🎨 DSA Visualizer</h1>
        <p className="text-sm text-secondary mt-0.5">Interactive algorithm animations</p>
      </div>

      <Tabs tabs={VIZ_TABS} active={tab} onChange={setTab} />

      {tab === 'sorting' && <SortingVisualizer />}
      {tab === 'tree' && <TreeVisualizer />}
      {tab === 'stack' && <StackQueueViz />}
      {tab === 'graph' && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">🕸️</div>
          <div className="text-base font-semibold">Graph Visualizer</div>
          <p className="text-sm text-secondary mt-2">BFS, DFS, Dijkstra's shortest path — coming soon</p>
        </div>
      )}
    </div>
  );
}
