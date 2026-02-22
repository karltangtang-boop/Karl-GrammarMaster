/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  BookOpen, 
  Trophy,
  ExternalLink,
  Info,
  Award,
  Trash2,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { questions as allQuestionsPool } from './data/questions';
import { Difficulty, GrammarCategory, MistakeRecord, Question } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const MASTERY_THRESHOLD = 2; // Number of consecutive correct answers to consider "mastered"

export default function App() {
  // Persistence for mistakes
  const [mistakeRecords, setMistakeRecords] = useState<MistakeRecord[]>(() => {
    const saved = localStorage.getItem('grammar_mistakes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | null>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [masteryPrompt, setMasteryPrompt] = useState<number | null>(null); // Question ID to prompt for removal

  // Initialize quiz with random questions + mistakes
  const startNewQuiz = () => {
    // 1. Get some random questions from the main pool
    const shuffledPool = shuffle(allQuestionsPool);
    const baseQuestions = shuffledPool.slice(0, 3); // Pick 3 random ones

    // 2. Get some random questions from mistakes
    const mistakeIds = mistakeRecords.map(r => r.questionId);
    const mistakePool = allQuestionsPool.filter(q => mistakeIds.includes(q.id));
    const randomMistakes = shuffle(mistakePool).slice(0, 2); // Pick up to 2 mistakes

    // 3. Combine and shuffle again
    const combined = shuffle([...new Set([...baseQuestions, ...randomMistakes])]);
    
    setActiveQuestions(combined);
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmitted({});
    setShowExplanation(false);
    setQuizFinished(false);
    setMasteryPrompt(null);
  };

  useEffect(() => {
    startNewQuiz();
  }, []);

  useEffect(() => {
    localStorage.setItem('grammar_mistakes', JSON.stringify(mistakeRecords));
  }, [mistakeRecords]);

  const currentQuestion = activeQuestions[currentIndex];
  const currentAnswer = currentQuestion ? (userAnswers[currentQuestion.id] || null) : null;
  const isCurrentSubmitted = currentQuestion ? (submitted[currentQuestion.id] || false) : false;

  const score = useMemo(() => {
    return activeQuestions.reduce((acc, q) => {
      if (submitted[q.id] && userAnswers[q.id] === q.correctOptionId) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }, [submitted, userAnswers, activeQuestions]);

  const handleSelectOption = (optionId: string) => {
    if (isCurrentSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const handleSubmit = () => {
    if (!currentAnswer || !currentQuestion) return;
    
    const isCorrect = currentAnswer === currentQuestion.correctOptionId;
    setSubmitted(prev => ({ ...prev, [currentQuestion.id]: true }));
    setShowExplanation(true);

    // Update mistake records
    setMistakeRecords(prev => {
      const existing = prev.find(r => r.questionId === currentQuestion.id);
      
      if (!isCorrect) {
        // If wrong, add or reset
        if (existing) {
          return prev.map(r => r.questionId === currentQuestion.id ? { ...r, consecutiveCorrect: 0 } : r);
        } else {
          return [...prev, { questionId: currentQuestion.id, consecutiveCorrect: 0 }];
        }
      } else {
        // If correct
        if (existing) {
          const updated = prev.map(r => 
            r.questionId === currentQuestion.id 
              ? { ...r, consecutiveCorrect: r.consecutiveCorrect + 1 } 
              : r
          );
          
          // Check for mastery
          const newRecord = updated.find(r => r.questionId === currentQuestion.id);
          if (newRecord && newRecord.consecutiveCorrect >= MASTERY_THRESHOLD) {
            setMasteryPrompt(currentQuestion.id);
          }
          return updated;
        }
        return prev;
      }
    });
  };

  const handleRemoveMistake = (id: number) => {
    setMistakeRecords(prev => prev.filter(r => r.questionId !== id));
    setMasteryPrompt(null);
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
      setMasteryPrompt(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowExplanation(false);
      setMasteryPrompt(null);
    }
  };

  const getEncouragement = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio === 1) return "太棒了！你是语法大师！🌟";
    if (ratio >= 0.8) return "非常出色！继续保持！👏";
    if (ratio >= 0.6) return "做得不错，再接再厉！👍";
    return "加油！多练习一定会进步的！💪";
  };

  if (!currentQuestion && !quizFinished) return null;

  if (quizFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100"
        >
          <div className="mb-6 inline-flex p-4 bg-yellow-50 rounded-full">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">练习完成！</h2>
          <p className="text-slate-500 mb-8">这是你的成绩单</p>
          
          <div className="flex justify-center items-baseline gap-2 mb-8">
            <span className="text-6xl font-black text-brand-600">{score}</span>
            <span className="text-2xl text-slate-300 font-medium">/ {activeQuestions.length}</span>
          </div>

          <p className="text-lg font-medium text-slate-700 mb-8">
            {getEncouragement(score, activeQuestions.length)}
          </p>

          <div className="space-y-3">
            <button 
              onClick={startNewQuiz}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              换一批题目
            </button>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400 mb-2">当前错题库：{mistakeRecords.length} 题</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">GrammarMaster</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              错题库: {mistakeRecords.length}
            </div>
            <div className="text-sm font-bold text-slate-400">
              {currentIndex + 1} <span className="text-slate-200">/</span> {activeQuestions.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100">
        <motion.div 
          className="h-full bg-brand-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                  currentQuestion.difficulty === Difficulty.Beginner && "bg-emerald-50 text-emerald-600",
                  currentQuestion.difficulty === Difficulty.Intermediate && "bg-amber-50 text-amber-600",
                  currentQuestion.difficulty === Difficulty.Advanced && "bg-rose-50 text-rose-600"
                )}>
                  {currentQuestion.difficulty}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  {currentQuestion.category}
                </span>
              </div>
              {mistakeRecords.some(r => r.questionId === currentQuestion.id) && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                  <RotateCcw className="w-3 h-3" />
                  错题回顾
                </span>
              )}
            </div>

            {/* Sentence Display */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
              <p className="text-2xl sm:text-3xl font-serif leading-relaxed text-slate-800">
                {currentQuestion.sentence.split('______').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={cn(
                        "inline-block min-w-[120px] border-b-2 mx-2 text-center transition-all px-2",
                        !currentAnswer && "border-slate-300 text-transparent",
                        currentAnswer && !isCurrentSubmitted && "border-brand-500 text-brand-600 font-bold",
                        isCurrentSubmitted && currentAnswer === currentQuestion.correctOptionId && "border-emerald-500 text-emerald-600 font-bold",
                        isCurrentSubmitted && currentAnswer !== currentQuestion.correctOptionId && "border-rose-500 text-rose-600 font-bold"
                      )}>
                        {currentQuestion.options.find(o => o.id === currentAnswer)?.text || "____"}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = currentAnswer === option.id;
                const isCorrect = option.id === currentQuestion.correctOptionId;
                
                let buttonClass = "group relative flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left font-medium";
                
                if (!isCurrentSubmitted) {
                  buttonClass = cn(
                    buttonClass,
                    isSelected 
                      ? "bg-brand-50 border-brand-500 text-brand-700 shadow-md" 
                      : "bg-white border-slate-100 hover:border-brand-200 text-slate-600 hover:bg-slate-50"
                  );
                } else {
                  if (isSelected) {
                    buttonClass = cn(
                      buttonClass,
                      isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-rose-50 border-rose-500 text-rose-700"
                    );
                  } else if (isCorrect) {
                    buttonClass = cn(buttonClass, "bg-emerald-50/50 border-emerald-200 text-emerald-600 opacity-80");
                  } else {
                    buttonClass = cn(buttonClass, "bg-white border-slate-50 text-slate-300 opacity-50 cursor-not-allowed");
                  }
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isCurrentSubmitted}
                    className={buttonClass}
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors",
                        isSelected ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-brand-100 group-hover:text-brand-600"
                      )}>
                        {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                      </span>
                      {option.text}
                    </span>
                    {isCurrentSubmitted && isSelected && (
                      isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mastery Prompt */}
            <AnimatePresence>
              {masteryPrompt === currentQuestion.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">掌握度提升！</h4>
                      <p className="text-emerald-50 text-sm">你已连续多次答对该题，是否将其从错题库中移除？</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleRemoveMistake(currentQuestion.id)}
                      className="flex-1 sm:flex-none px-6 py-2 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      移除
                    </button>
                    <button 
                      onClick={() => setMasteryPrompt(null)}
                      className="flex-1 sm:flex-none px-6 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors"
                    >
                      保留
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {!isCurrentSubmitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!currentAnswer}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                    currentAnswer 
                      ? "bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  提交答案
                </button>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="flex-1 py-4 bg-white border-2 border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Info className="w-5 h-5" />
                    {showExplanation ? "隐藏解析" : "查看解析"}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200"
                  >
                    {currentIndex === activeQuestions.length - 1 ? "完成练习" : "下一题"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Explanation Card */}
            <AnimatePresence>
              {showExplanation && isCurrentSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6"
                >
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="p-2 bg-brand-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">详解卡片</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">正确答案</h4>
                        <p className="text-lg font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg">
                          {currentQuestion.explanation.correctAnswer}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">语法规则</h4>
                        <p className="text-slate-700 leading-relaxed">
                          {currentQuestion.explanation.rule}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">典型例句</h4>
                        <p className="text-slate-700 italic font-serif bg-slate-50 p-3 rounded-xl border-l-4 border-slate-200">
                          "{currentQuestion.explanation.example}"
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">常见错误辨析</h4>
                        <p className="text-slate-600 text-sm">
                          {currentQuestion.explanation.commonMistake}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentQuestion.explanation.reviewLink && (
                    <div className="pt-4 border-t border-slate-100">
                      <a 
                        href={currentQuestion.explanation.reviewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm"
                      >
                        相关语法复习链接
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="flex gap-2">
            {activeQuestions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setShowExplanation(false);
                  setMasteryPrompt(null);
                }}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  i === currentIndex ? "bg-brand-500 w-6" : "bg-slate-200 hover:bg-slate-300",
                  submitted[activeQuestions[i].id] && (userAnswers[activeQuestions[i].id] === activeQuestions[i].correctOptionId ? "bg-emerald-400" : "bg-rose-400")
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === activeQuestions.length - 1 && !isCurrentSubmitted}
            className="p-2 text-slate-400 hover:text-brand-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </footer>
    </div>
  );
}
