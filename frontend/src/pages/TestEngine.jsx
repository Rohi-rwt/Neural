import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { testAPI } from '@/services/api';
import { LoadingSpinner, DifficultyTag } from '@/components/common/UI';
import toast from 'react-hot-toast';

export default function TestEngine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const { data: testData, isLoading } = useQuery({
    queryKey: ['test', id],
    queryFn: () => testAPI.getOne(id).then(r => r.data.test),
    enabled: !!id
  });

  const startMutation = useMutation({
    mutationFn: () => testAPI.start(id).then(r => r.data),
    onSuccess: (data) => {
      setAttemptId(data.attemptId);
      setStarted(true);
      const duration = (testData?.duration || 45) * 60;
      setTimeLeft(duration);
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data) => testAPI.submit(id, data).then(r => r.data),
    onSuccess: (data) => {
      clearInterval(timerRef.current);
      navigate(`/tests/result/${attemptId}`, { state: { result: data.result, test: testData } });
    },
    onError: () => toast.error('Submission failed. Please try again.')
  });

  useEffect(() => {
    if (started && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started]);

  const handleSubmit = () => {
    const processedAnswers = Object.entries(answers).map(([problemId, selectedAnswer]) => ({ problemId, selectedAnswer }));
    const timeTaken = testData ? (testData.duration * 60) - (timeLeft || 0) : 0;
    submitMutation.mutate({ attemptId, answers: processedAnswers, timeTaken });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>;
  if (!testData) return <div className="p-6 text-secondary">Test not found.</div>;

  const questions = testData.questions || [];
  const currentProblem = questions[currentQ]?.problem;
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const timePercent = testData.duration ? (timeLeft / (testData.duration * 60)) * 100 : 100;
  const isLowTime = timeLeft !== null && timeLeft < 300;

  if (!started) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="card max-w-md w-full text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-bold mb-2">{testData.title}</h2>
          <p className="text-secondary text-sm mb-6">{testData.description}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{ l: 'Questions', v: totalQ }, { l: 'Duration', v: `${testData.duration} min` }, { l: 'Difficulty', v: testData.difficulty }, { l: 'XP Reward', v: `+${testData.xpReward}` }].map(s => (
              <div key={s.l} className="bg-surface3 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-accent">{s.v}</div>
                <div className="text-xs text-muted">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-400">
            ⚠️ Once started, the timer cannot be paused. Ensure you're ready!
          </div>
          <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending} className="btn-primary w-full justify-center">
            {startMutation.isPending ? <LoadingSpinner size={16} /> : '🚀 Start Test'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Timer bar */}
      <div className="bg-surface2 border-b border-surface px-4 py-2 flex items-center gap-4">
        <div className="text-sm font-semibold truncate flex-1">{testData.title}</div>
        <div className="flex-1 hidden md:block">
          <div className="progress-bar">
            <div className={`h-full rounded-full transition-all ${isLowTime ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'}`} style={{ width: `${timePercent}%` }} />
          </div>
        </div>
        <div className={`text-xl font-bold font-mono ${isLowTime ? 'text-red-400' : 'text-amber-400'}`}>
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
        <button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-danger text-xs py-1.5">
          {submitMutation.isPending ? <LoadingSpinner size={12} /> : 'Submit'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Questions list sidebar */}
        <div className="w-48 bg-surface2 border-r border-surface p-3 overflow-y-auto hidden md:block">
          <div className="text-xs text-muted mb-2">{answeredCount}/{totalQ} answered</div>
          <div className="grid grid-cols-5 gap-1">
            {questions.map((q, i) => {
              const pId = q.problem?._id;
              const isAnswered = pId && answers[pId];
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                    i === currentQ ? 'bg-accent text-white' :
                    isAnswered ? 'bg-emerald-500/30 text-emerald-400' :
                    'bg-surface3 text-secondary hover:bg-surface3'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentProblem ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted">Question {currentQ + 1} of {totalQ}</span>
                <DifficultyTag difficulty={currentProblem.difficulty} />
                <span className="tag-accent text-[10px] ml-auto">{questions[currentQ]?.marks || 4} marks</span>
              </div>
              <div className="text-base font-medium mb-6 leading-relaxed">{currentProblem.title}</div>
              {currentProblem.description && (
                <div className="text-sm text-secondary mb-6 leading-relaxed">{currentProblem.description}</div>
              )}
              <div className="space-y-2">
                {(currentProblem.options || []).map(opt => {
                  const isSelected = answers[currentProblem._id] === opt.label;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => setAnswers(a => ({ ...a, [currentProblem._id]: opt.label }))}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all text-sm ${
                        isSelected ? 'border-accent bg-accent/10 text-accent' : 'border-surface hover:border-accent/40 text-secondary'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'border-accent' : 'border-slate-600'}`}>{opt.label}</span>
                      {opt.text}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} className="btn-outline text-sm disabled:opacity-40">← Previous</button>
                {currentQ < totalQ - 1
                  ? <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary text-sm">Next →</button>
                  : <button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-primary text-sm">Submit Test ✓</button>
                }
              </div>
            </div>
          ) : (
            <div className="text-center text-muted py-16">No question data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
