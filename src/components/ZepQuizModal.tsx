import React, { useState, useEffect } from 'react';
import { BibleVerse, QuizType } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import confetti from 'canvas-confetti';
import { bgmSynth } from '../utils/bgmSynth';
import {
  X,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ZepQuizModalProps {
  verse: BibleVerse;
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerse: (verseId: number, earnedPoints: number) => void;
  hasShieldItem?: boolean;
}

const QUIZ_TYPES: { id: QuizType; label: string; icon: string; desc: string }[] = [
  { id: 'word_order', label: '단어 순서 맞추기', icon: '🧩', desc: '흩어진 말씀 조각을 기억하여 바른 순서로 배열하세요.' },
  { id: 'blank_fill', label: '빈칸 맞추기', icon: '✏️', desc: '말씀 속 핵심 빈칸에 들어갈 올바른 단어를 고르세요.' },
  { id: 'reference_match', label: '성경 구절 주소 맞추기', icon: '📖', desc: '제시된 말씀을 읽고 올바른 성경 장/절 주소를 맞추세요.' },
];

export const ZepQuizModal: React.FC<ZepQuizModalProps> = ({
  verse,
  isOpen,
  onClose,
  onCompleteVerse,
  hasShieldItem = false,
}) => {
  // Current randomly chosen quiz type
  const [selectedQuiz, setSelectedQuiz] = useState<{ id: QuizType; label: string; icon: string; desc: string }>(QUIZ_TYPES[0]);

  // Word Order Quiz State
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Blank Fill Quiz State
  const [blankAnswer, setBlankAnswer] = useState<string>('');
  const [blankOptions, setBlankOptions] = useState<string[]>([]);

  // Reference Match Quiz State
  const [refMatchOptions, setRefMatchOptions] = useState<string[]>([]);
  const [selectedRefChoice, setSelectedRefChoice] = useState<string>('');

  // Status & Feedback
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [shieldUsed, setShieldUsed] = useState(false);

  // Determine difficulty tier based on verse ID / station number (1 ~ 36)
  const stationNum = verse ? verse.id : 1;
  const difficultyTier = stationNum <= 12 ? 1 : stationNum <= 24 ? 2 : 3;
  const difficultyLabel = difficultyTier === 1 ? '초급 ⭐' : difficultyTier === 2 ? '중급 ⭐⭐' : '고급 ⭐⭐⭐';
  const difficultyColor =
    difficultyTier === 1
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      : difficultyTier === 2
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

  // Function to initialize & scramble quiz based on verse & difficulty
  const initializeRandomQuiz = (quizTypeOverride?: QuizType) => {
    if (!verse) return;
    setIsCorrect(null);
    setFeedbackMsg('');
    setShieldUsed(false);

    // Pick 1 random quiz type out of the 3, or use override
    const targetType = quizTypeOverride || QUIZ_TYPES[Math.floor(Math.random() * QUIZ_TYPES.length)].id;
    const quizConfig = QUIZ_TYPES.find((q) => q.id === targetType) || QUIZ_TYPES[0];
    setSelectedQuiz(quizConfig);

    // 1. Prepare Word Order Scramble according to Difficulty
    const words = verse.text.split(' ').filter(Boolean);
    let chunks: string[] = [];

    if (difficultyTier === 1) {
      // Easy: Group words into 3~4 phrase chunks
      const chunkSize = Math.ceil(words.length / 3);
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    } else if (difficultyTier === 2) {
      // Medium: Group words into 4~5 phrase chunks
      const chunkSize = Math.ceil(words.length / 5);
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    } else {
      // Hard: Detailed individual word/phrase scramble
      const chunkSize = Math.max(1, Math.floor(words.length / 7));
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    }

    const shuffled = [...chunks].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled);
    setSelectedWords([]);

    // 2. Prepare Blank Fill Quiz
    const keyword = verse.keywords[0] || words[Math.floor(words.length / 2)] || '하나님';
    setBlankAnswer(keyword);

    // Generate 3 distractor keywords
    const otherVerses = BIBLE_VERSES.filter((v) => v.id !== verse.id);
    const distractorPool: string[] = [];
    otherVerses.forEach((v) => {
      v.keywords.forEach((k) => {
        if (k !== keyword && !distractorPool.includes(k)) {
          distractorPool.push(k);
        }
      });
    });

    const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [keyword, ...shuffledDistractors].sort(() => Math.random() - 0.5);
    setBlankOptions(options);

    // 3. Prepare Reference Match Quiz
    const otherRefs = otherVerses.map((v) => v.reference).sort(() => Math.random() - 0.5).slice(0, 3);
    const refOptions = [verse.reference, ...otherRefs].sort(() => Math.random() - 0.5);
    setRefMatchOptions(refOptions);
    setSelectedRefChoice('');
  };

  useEffect(() => {
    if (isOpen && verse) {
      initializeRandomQuiz();
    }
  }, [isOpen, verse]);

  if (!isOpen || !verse) return null;

  // Point Calculation based on Difficulty
  const pointsReward = difficultyTier === 1 ? 50 : difficultyTier === 2 ? 80 : 120;

  // Handle selecting scrambled word block
  const handleSelectWordBlock = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    setScrambledWords(scrambledWords.filter((_, idx) => idx !== index));
  };

  // Handle deselecting word block from chosen row
  const handleDeselectWordBlock = (word: string, index: number) => {
    setSelectedWords(selectedWords.filter((_, idx) => idx !== index));
    setScrambledWords([...scrambledWords, word]);
  };

  // Verify Word Order
  const handleVerifyWordOrder = () => {
    const userSentence = selectedWords.join(' ').replace(/\s+/g, ' ').trim();
    const targetSentence = verse.text.replace(/\s+/g, ' ').trim();

    if (userSentence === targetSentence) {
      handleSuccess();
    } else {
      handleFailure('단어 순서가 올바르지 않습니다. 다시 확인해보세요!');
    }
  };

  // Verify Blank Option Choice
  const handleVerifyBlank = (chosen: string) => {
    if (chosen === blankAnswer) {
      handleSuccess();
    } else {
      handleFailure(`'${chosen}'은(는) 올바른 빈칸 정답이 아닙니다. 다시 시도해보세요!`);
    }
  };

  // Verify Reference Match Option
  const handleVerifyRefMatch = (chosenRef: string) => {
    setSelectedRefChoice(chosenRef);
    if (chosenRef === verse.reference) {
      handleSuccess();
    } else {
      handleFailure(`'${chosenRef}'은(는) 올바른 장/절 주소가 아닙니다.`);
    }
  };

  // Handle Success Flow
  const handleSuccess = () => {
    bgmSynth.playFanfare();
    setIsCorrect(true);
    setFeedbackMsg(`🎉 정답입니다! 말씀 암송 완료! (+${pointsReward}점 획득)`);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onCompleteVerse(verse.id, pointsReward);

    setTimeout(() => {
      onClose();
    }, 1800);
  };

  // Handle Failure with Shield Protection Check
  const handleFailure = (msg: string) => {
    if (hasShieldItem && !shieldUsed) {
      setShieldUsed(true);
      setFeedbackMsg('🛡️ 믿음의 방패로 실수를 1회 방어했습니다! 다시 시도하세요.');
      return;
    }
    setIsCorrect(false);
    setFeedbackMsg(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-4 touch-pan-y overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-3 sm:p-6 md:p-8 max-w-2xl w-full max-h-[88vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y shadow-2xl relative text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 sm:pb-4 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 sm:p-2.5 rounded-2xl border border-amber-500/30 shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${difficultyColor}`}>
                  {difficultyLabel}
                </span>
                <span className="text-[11px] sm:text-xs text-amber-400 font-bold">미션 #{stationNum}</span>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-amber-300 mt-0.5">
                {selectedQuiz.id === 'reference_match'
                  ? `[주제: ${verse.theme}] 암송 테스트`
                  : `[${verse.reference}] 암송 테스트`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer active:scale-95 shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Single Randomized Quiz Header Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-500/40 rounded-2xl p-3 sm:p-3.5 mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-xl sm:text-2xl">{selectedQuiz.icon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                  랜덤 지정 퀴즈
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-white">{selectedQuiz.label}</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{selectedQuiz.desc}</p>
            </div>
          </div>

          {/* Reroll Button */}
          <button
            onClick={() => initializeRandomQuiz()}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer shrink-0 active:scale-95"
            title="다른 퀴즈 유형 뽑기"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">다른 퀴즈</span>
          </button>
        </div>

        {/* Quiz Content Container */}
        <div className="bg-slate-950/60 p-3.5 sm:p-5 rounded-2xl border border-slate-800 mb-4 min-h-[180px] flex flex-col justify-between">
          {/* TYPE 1: WORD ORDER SCRAMBLE */}
          {selectedQuiz.id === 'word_order' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-[11px] sm:text-xs text-slate-300 font-bold flex items-center justify-between">
                <span>[{verse.reference}] 의 암송 구절 순서를 바르게 맞추세요:</span>
              </div>

              {/* User Selected Area */}
              <div className="min-h-[60px] bg-slate-900 border-2 border-dashed border-amber-500/40 rounded-xl p-2.5 sm:p-3 flex flex-wrap gap-2 items-center">
                {selectedWords.length === 0 ? (
                  <span className="text-[11px] sm:text-xs text-slate-500">아래 말씀 조각을 터치하면 순서대로 배치됩니다...</span>
                ) : (
                  selectedWords.map((word, idx) => (
                    <button
                      key={`selected_${idx}`}
                      onClick={() => handleDeselectWordBlock(word, idx)}
                      className="bg-amber-500 active:bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs sm:text-sm font-black shadow transition cursor-pointer active:scale-95"
                    >
                      {word}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Available Options */}
              <div className="flex flex-wrap gap-2 pt-1">
                {scrambledWords.map((word, idx) => (
                  <button
                    key={`scrambled_${idx}`}
                    onClick={() => handleSelectWordBlock(word, idx)}
                    className="bg-slate-800 border border-slate-700 active:border-amber-400 text-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95"
                  >
                    {word}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerifyWordOrder}
                  disabled={selectedWords.length === 0}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95"
                >
                  정답 확인하기 (+{pointsReward}점)
                </button>
              </div>
            </div>
          )}

          {/* TYPE 2: BLANK FILL */}
          {selectedQuiz.id === 'blank_fill' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] sm:text-xs text-slate-300 font-bold">
                [{verse.reference}] 말씀 속 빈칸 `[ ___ ]` 에 들어갈 단어를 고르세요:
              </p>
              <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-center font-bold text-amber-200 leading-relaxed">
                "{verse.text.replace(verse.keywords[0] || '', ' [ ___ ] ')}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {blankOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVerifyBlank(option)}
                    className="p-3.5 bg-slate-900 border border-slate-800 active:border-amber-400 hover:bg-amber-500/10 text-white font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer text-center active:scale-95 min-h-[44px]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TYPE 3: REFERENCE MATCHING QUIZ */}
          {selectedQuiz.id === 'reference_match' && (
            <div className="space-y-3 sm:space-y-4 text-center">
              <p className="text-[11px] sm:text-xs text-slate-300 font-bold">
                아래 말씀에 해당하는 정확한 성경 구절 주소를 고르세요:
              </p>
              <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold leading-relaxed shadow-inner">
                "{verse.text}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {refMatchOptions.map((refOpt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleVerifyRefMatch(refOpt)}
                    className={`p-3.5 rounded-xl text-xs sm:text-sm font-black border transition cursor-pointer active:scale-95 min-h-[44px] ${
                      selectedRefChoice === refOpt
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 hover:border-amber-400 hover:bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    📖 {refOpt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback Area */}
        {feedbackMsg && (
          <div
            className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm font-bold text-center border animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/80 border-rose-500 text-rose-300'
            }`}
          >
            {feedbackMsg}
          </div>
        )}
      </div>
    </div>
  );
};
