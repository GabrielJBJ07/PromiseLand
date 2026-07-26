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
  Keyboard,
  RotateCcw,
} from 'lucide-react';

interface ZepQuizModalProps {
  verse: BibleVerse;
  isOpen: boolean;
  onClose: () => void;
  onCompleteVerse: (verseId: number, earnedPoints: number) => void;
  hasShieldItem?: boolean;
}

interface QuizTypeConfig {
  id: QuizType;
  label: string;
  icon: string;
  desc: string;
  level: number; // 7 (Highest) down to 1 (Lowest)
  levelLabel: string;
  basePoints: number;
}

// 7 Quiz Types ordered from HIGHEST difficulty (Level 7) to LOWEST difficulty (Level 1)
const QUIZ_TYPES: QuizTypeConfig[] = [
  {
    id: 'full_typing',
    label: '성경 구절 전체 직접 작성',
    icon: '⌨️',
    desc: '성경 구절 전체를 토씨 하나 틀리지 않고 직접 타자로 작성하세요.',
    level: 7,
    levelLabel: 'Lv.7 최고 난이도 ⭐⭐⭐⭐⭐⭐⭐',
    basePoints: 150,
  },
  {
    id: 'word_order',
    label: '단어별 구절 순서 배열',
    icon: '🧩',
    desc: '낱개로 흩어진 모든 단어 조각을 바른 순서대로 배열하세요.',
    level: 6,
    levelLabel: 'Lv.6 고난도 ⭐⭐⭐⭐⭐⭐',
    basePoints: 130,
  },
  {
    id: 'phrase_order',
    label: '문단별(마디) 구절 순서 배열',
    icon: '✂️',
    desc: '구절의 큰 마디/문단 덩어리를 바른 순서대로 배열하세요.',
    level: 5,
    levelLabel: 'Lv.5 중고난도 ⭐⭐⭐⭐⭐',
    basePoints: 110,
  },
  {
    id: 'blank_fill_3',
    label: '괄호 빈칸 맞추기 (3개 이상)',
    icon: '3️⃣',
    desc: '말씀 속 3개 이상의 괄호 빈칸을 순서대로 터치하여 채우세요.',
    level: 4,
    levelLabel: 'Lv.4 중급 ⭐⭐⭐⭐',
    basePoints: 90,
  },
  {
    id: 'blank_fill_2',
    label: '괄호 빈칸 맞추기 (2개)',
    icon: '2️⃣',
    desc: '말씀 속 2개의 괄호 빈칸을 순서대로 터치하여 채우세요.',
    level: 3,
    levelLabel: 'Lv.3 중약급 ⭐⭐⭐',
    basePoints: 70,
  },
  {
    id: 'blank_fill_1',
    label: '괄호 빈칸 맞추기 (1개)',
    icon: '1️⃣',
    desc: '말씀 속 1개의 핵심 괄호 빈칸에 들어갈 단어를 고르세요.',
    level: 2,
    levelLabel: 'Lv.2 초급 ⭐⭐',
    basePoints: 50,
  },
  {
    id: 'reference_match',
    label: '성경 구절 주소 맞추기',
    icon: '📖',
    desc: '제시된 말씀을 읽고 올바른 성경 장/절 주소를 맞추세요.',
    level: 1,
    levelLabel: 'Lv.1 최저 난이도 ⭐',
    basePoints: 30,
  },
];

export const ZepQuizModal: React.FC<ZepQuizModalProps> = ({
  verse,
  isOpen,
  onClose,
  onCompleteVerse,
  hasShieldItem = false,
}) => {
  // Current chosen quiz type
  const [selectedQuiz, setSelectedQuiz] = useState<QuizTypeConfig>(QUIZ_TYPES[0]);

  // LEVEL 7: Full Typing State
  const [typedInput, setTypedInput] = useState<string>('');

  // LEVEL 6 & LEVEL 5: Scramble Order States (Word or Phrase)
  const [scrambledBlocks, setScrambledBlocks] = useState<string[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

  // LEVEL 2, 3, 4: Sequential Blank Fill States
  const [blankTargets, setBlankTargets] = useState<string[]>([]); // Target answer words in order
  const [blankSelectedWords, setBlankSelectedWords] = useState<(string | null)[]>([]); // User selected slots
  const [blankCandidateOptions, setBlankCandidateOptions] = useState<string[]>([]); // Options pool

  // LEVEL 1: Reference Match State
  const [refMatchOptions, setRefMatchOptions] = useState<string[]>([]);
  const [selectedRefChoice, setSelectedRefChoice] = useState<string>('');

  // Status & Feedback
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [shieldUsed, setShieldUsed] = useState(false);
  const [rerollCount, setRerollCount] = useState<number>(0);

  // Station number & base rewards
  const stationNum = verse ? verse.id : 1;
  const penaltyPerReroll = 10;
  const pointsReward = Math.max(20, selectedQuiz.basePoints - rerollCount * penaltyPerReroll);

  // Clean text helper for typing comparison
  const normalizeText = (str: string) => {
    return str
      .replace(/[.,~!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Main Quiz Initialization
  const initializeRandomQuiz = (quizTypeOverride?: QuizType) => {
    if (!verse) return;
    setIsCorrect(null);
    setFeedbackMsg('');
    setShieldUsed(false);

    // Pick target quiz configuration
    let targetConfig: QuizTypeConfig;
    if (quizTypeOverride) {
      targetConfig = QUIZ_TYPES.find((q) => q.id === quizTypeOverride) || QUIZ_TYPES[0];
    } else {
      // Default to highest difficulty (Level 7: Full Typing) on initial open
      targetConfig = QUIZ_TYPES[0];
    }
    setSelectedQuiz(targetConfig);

    const words = verse.text.split(' ').filter(Boolean);

    // 1. LEVEL 7: Full Typing Setup
    setTypedInput('');

    // 2. LEVEL 6: Word Order Setup
    // 3. LEVEL 5: Phrase Order Setup
    let orderChunks: string[] = [];
    if (targetConfig.id === 'word_order') {
      orderChunks = [...words];
    } else if (targetConfig.id === 'phrase_order') {
      // Split into 3~4 phrase chunks
      const chunkSize = Math.max(1, Math.ceil(words.length / 3));
      for (let i = 0; i < words.length; i += chunkSize) {
        orderChunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    }
    if (orderChunks.length > 0) {
      let shuffled = [...orderChunks].sort(() => Math.random() - 0.5);
      if (shuffled.length > 1 && shuffled.join(' ') === verse.text) {
        shuffled = [...orderChunks].reverse();
      }
      setScrambledBlocks(shuffled);
      setSelectedBlocks([]);
    }

    // 4. LEVEL 2, 3, 4: Sequential Blank Fill Setup
    let blankCount = 1;
    if (targetConfig.id === 'blank_fill_2') blankCount = 2;
    if (targetConfig.id === 'blank_fill_3') blankCount = Math.min(words.length, Math.max(3, verse.keywords.length));

    // Extract target blank words from keywords or spaced words
    const targets: string[] = [];
    if (verse.keywords && verse.keywords.length >= blankCount) {
      targets.push(...verse.keywords.slice(0, blankCount));
    } else {
      // Pick distinct words from the verse text
      const candidateWords = words.filter((w) => w.length >= 2);
      for (let i = 0; i < blankCount; i++) {
        const wordToPick = candidateWords[i % candidateWords.length] || words[i % words.length];
        if (!targets.includes(wordToPick)) {
          targets.push(wordToPick);
        }
      }
    }

    setBlankTargets(targets);
    setBlankSelectedWords(new Array(targets.length).fill(null));

    // Create distractor option pool
    const otherVerses = BIBLE_VERSES.filter((v) => v.id !== verse.id);
    const distractorPool: string[] = [];
    otherVerses.forEach((v) => {
      v.keywords.forEach((k) => {
        if (!targets.includes(k) && !distractorPool.includes(k)) {
          distractorPool.push(k);
        }
      });
    });

    const neededDistractors = Math.max(2, blankCount + 2);
    const shuffledDistractors = distractorPool.sort(() => Math.random() - 0.5).slice(0, neededDistractors);
    const allOptions = [...targets, ...shuffledDistractors].sort(() => Math.random() - 0.5);
    setBlankCandidateOptions(allOptions);

    // 5. LEVEL 1: Reference Match Setup
    const otherRefs = otherVerses.map((v) => v.reference).sort(() => Math.random() - 0.5).slice(0, 3);
    const refOptions = [verse.reference, ...otherRefs].sort(() => Math.random() - 0.5);
    setRefMatchOptions(refOptions);
    setSelectedRefChoice('');
  };

  useEffect(() => {
    if (isOpen && verse) {
      setRerollCount(0);
      initializeRandomQuiz();
    }
  }, [isOpen, verse]);

  if (!isOpen || !verse) return null;

  // Reroll handler: step down difficulty by 1 level sequentially (Level 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1 -> 7)
  const handleRerollQuiz = () => {
    setRerollCount((prev) => prev + 1);
    const currentIdx = QUIZ_TYPES.findIndex((q) => q.id === selectedQuiz.id);
    const nextIdx = currentIdx !== -1 ? (currentIdx + 1) % QUIZ_TYPES.length : 0;
    const nextType = QUIZ_TYPES[nextIdx].id;
    initializeRandomQuiz(nextType);
  };

  // --- HANDLERS FOR LEVEL 7: Full Typing ---
  const handleVerifyTyping = () => {
    if (normalizeText(typedInput) === normalizeText(verse.text)) {
      handleSuccess();
    } else {
      handleFailure('작성한 말씀 구절에 오탈자가 있습니다. 글자 하나하나 다시 확인해 보세요!');
    }
  };

  // --- HANDLERS FOR LEVEL 6 & 5: Scramble Blocks ---
  const handleSelectBlock = (block: string, index: number) => {
    setSelectedBlocks([...selectedBlocks, block]);
    setScrambledBlocks(scrambledBlocks.filter((_, idx) => idx !== index));
  };

  const handleDeselectBlock = (block: string, index: number) => {
    setSelectedBlocks(selectedBlocks.filter((_, idx) => idx !== index));
    setScrambledBlocks([...scrambledBlocks, block]);
  };

  const handleVerifyScramble = () => {
    const userSentence = selectedBlocks.join(' ').replace(/\s+/g, ' ').trim();
    const targetSentence = verse.text.replace(/\s+/g, ' ').trim();

    if (userSentence === targetSentence) {
      handleSuccess();
    } else {
      handleFailure('구절 순서가 올바르지 않습니다. 조각 순서를 재조정해 보세요!');
    }
  };

  // --- HANDLERS FOR LEVEL 2, 3, 4: Sequential Blank Fill ---
  // Users select candidates IN ORDER into the first empty blank slot (1 -> 2 -> 3...)
  const handleSelectBlankCandidate = (word: string) => {
    // Find first null slot
    const firstEmptyIdx = blankSelectedWords.findIndex((slot) => slot === null);
    if (firstEmptyIdx !== -1) {
      const nextArr = [...blankSelectedWords];
      nextArr[firstEmptyIdx] = word;
      setBlankSelectedWords(nextArr);
    }
  };

  // Click on a filled slot to clear that slot
  const handleClearBlankSlot = (slotIdx: number) => {
    const nextArr = [...blankSelectedWords];
    nextArr[slotIdx] = null;
    setBlankSelectedWords(nextArr);
  };

  // Clear all blank slots
  const handleResetAllBlankSlots = () => {
    setBlankSelectedWords(new Array(blankTargets.length).fill(null));
  };

  const handleVerifyBlankFill = () => {
    const isAllFilled = blankSelectedWords.every((val) => val !== null);
    if (!isAllFilled) {
      setFeedbackMsg('⚠️ 모든 괄호 빈칸을 순서대로 선택하여 채워주세요!');
      return;
    }

    const isMatch = blankSelectedWords.every((val, idx) => val === blankTargets[idx]);
    if (isMatch) {
      handleSuccess();
    } else {
      handleFailure('일부 괄호 빈칸 정답이 틀렸습니다. 올바른 순서대로 다시 선택하세요!');
    }
  };

  // --- HANDLER FOR LEVEL 1: Reference Match ---
  const handleVerifyRefMatch = (chosenRef: string) => {
    setSelectedRefChoice(chosenRef);
    if (chosenRef === verse.reference) {
      handleSuccess();
    } else {
      handleFailure(`'${chosenRef}'은(는) 올바른 장/절 주소가 아닙니다.`);
    }
  };

  // Common Success & Failure Logic
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

  const handleFailure = (msg: string) => {
    if (hasShieldItem && !shieldUsed) {
      setShieldUsed(true);
      setFeedbackMsg('🛡️ 믿음의 방패로 실수를 1회 방어했습니다! 다시 시도하세요.');
      return;
    }
    setIsCorrect(false);
    setFeedbackMsg(msg);
  };

  // Render verse text with blank placeholders for sequential fill
  const renderVerseWithBlanks = () => {
    let renderedText = verse.text;

    blankTargets.forEach((targetWord, idx) => {
      const selectedWord = blankSelectedWords[idx];
      const slotNumStr = `[ ${idx + 1}번 괄호: ${selectedWord ? selectedWord : '___'} ]`;
      renderedText = renderedText.replace(targetWord, ` ${slotNumStr} `);
    });

    return renderedText;
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
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[10px] sm:text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                  {selectedQuiz.levelLabel}
                </span>
                <span className="text-[11px] sm:text-xs text-amber-400 font-bold">미션 #{stationNum}</span>
                <span className="text-[10px] sm:text-[11px] font-black bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  🏆 {pointsReward}점 획득 가능
                  {rerollCount > 0 && <span className="text-rose-300 ml-1">(-{rerollCount * penaltyPerReroll}점 차감)</span>}
                </span>
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

        {/* Selected Quiz Level & Info Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-500/40 rounded-2xl p-3 sm:p-3.5 mb-3 sm:mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-xl sm:text-2xl">{selectedQuiz.icon}</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full">
                  난이도 레벨 {selectedQuiz.level}
                </span>
                <h3 className="font-extrabold text-xs sm:text-sm text-white">{selectedQuiz.label}</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">{selectedQuiz.desc}</p>
            </div>
          </div>

          {/* Reroll Button */}
          <button
            onClick={handleRerollQuiz}
            className="flex flex-col items-center justify-center bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition cursor-pointer shrink-0 active:scale-95 shadow"
            title={`다른 퀴즈로 변경 시 ${penaltyPerReroll}점이 차감됩니다.`}
          >
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>다른 퀴즈</span>
            </div>
            <span className="text-[9px] text-rose-300 font-semibold">(-{penaltyPerReroll}점 차감)</span>
          </button>
        </div>

        {/* Quiz Body */}
        <div className="bg-slate-950/60 p-3.5 sm:p-5 rounded-2xl border border-slate-800 mb-4 min-h-[190px] flex flex-col justify-between">
          
          {/* ---------------- LEVEL 7: FULL TYPING ---------------- */}
          {selectedQuiz.id === 'full_typing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-300 font-bold">
                <span className="flex items-center gap-1">
                  <Keyboard className="w-4 h-4 text-amber-400" /> [{verse.reference}] 말씀 전체를 아래 상자에 입력하세요:
                </span>
                <span className="text-[10px] text-slate-400">({verse.text.length}자)</span>
              </div>

              <textarea
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={`[${verse.reference}] 성경 구절 주소를 확인하고 암송 말씀을 직접 정확히 입력하세요...`}
                rows={4}
                className="w-full bg-slate-900 border-2 border-amber-500/40 focus:border-amber-400 rounded-xl p-3 text-xs sm:text-sm text-amber-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>입력한 글자 수: {typedInput.length} / {verse.text.length}자</span>
                {typedInput.trim().length > 0 && (
                  <button
                    onClick={() => setTypedInput('')}
                    className="text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> 다시 쓰기
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleVerifyTyping}
                  disabled={typedInput.trim().length === 0}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 shadow-lg"
                >
                  제출 및 정답 확인 (+{pointsReward}점)
                </button>
              </div>
            </div>
          )}

          {/* ---------------- LEVEL 6 & 5: SCRAMBLE ORDER (WORD / PHRASE) ---------------- */}
          {(selectedQuiz.id === 'word_order' || selectedQuiz.id === 'phrase_order') && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-[11px] sm:text-xs text-slate-300 font-bold">
                [{verse.reference}] 암송 조각을 바른 순서대로 터치하여 배치하세요:
              </div>

              {/* User Selected Order Container */}
              <div className="min-h-[64px] bg-slate-900 border-2 border-dashed border-amber-500/40 rounded-xl p-2.5 sm:p-3 flex flex-wrap gap-2 items-center">
                {selectedBlocks.length === 0 ? (
                  <span className="text-[11px] sm:text-xs text-slate-500">아래 조각들을 순서대로 터치하면 이곳에 배열됩니다...</span>
                ) : (
                  selectedBlocks.map((block, idx) => (
                    <button
                      key={`selected_${idx}`}
                      onClick={() => handleDeselectBlock(block, idx)}
                      className="bg-amber-500 active:bg-amber-400 text-slate-950 px-3 py-2 rounded-xl text-xs sm:text-sm font-black shadow transition cursor-pointer active:scale-95"
                    >
                      {block}
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Available Pool */}
              <div className="flex flex-wrap gap-2 pt-1">
                {scrambledBlocks.map((block, idx) => (
                  <button
                    key={`scrambled_${idx}`}
                    onClick={() => handleSelectBlock(block, idx)}
                    className="bg-slate-800 border border-slate-700 active:border-amber-400 text-slate-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95"
                  >
                    {block}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerifyScramble}
                  disabled={selectedBlocks.length === 0}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black px-5 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 shadow-lg"
                >
                  정답 확인하기 (+{pointsReward}점)
                </button>
              </div>
            </div>
          )}

          {/* ---------------- LEVEL 2, 3, 4: SEQUENTIAL BLANK FILL ---------------- */}
          {(selectedQuiz.id === 'blank_fill_1' || selectedQuiz.id === 'blank_fill_2' || selectedQuiz.id === 'blank_fill_3') && (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-300 font-bold">
                <span>[{verse.reference}] 괄호 빈칸({blankTargets.length}개)을 **1번부터 순서대로** 터치하여 채우세요:</span>
                <button
                  onClick={handleResetAllBlankSlots}
                  className="text-amber-400 hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> 초기화
                </button>
              </div>

              {/* Verse Display with Slot Indicators */}
              <div className="bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-amber-500/30 text-xs sm:text-sm font-bold text-amber-200 leading-relaxed shadow-inner">
                "{renderVerseWithBlanks()}"
              </div>

              {/* Slot Progress Bar */}
              <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-amber-300 font-extrabold shrink-0">선택한 빈칸 순서:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {blankSelectedWords.map((val, idx) => (
                    <button
                      key={`slot_${idx}`}
                      onClick={() => handleClearBlankSlot(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer shrink-0 border ${
                        val !== null
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-800 text-slate-400 border-slate-700 border-dashed'
                      }`}
                      title={val ? '터치하여 지우기' : '빈칸입니다'}
                    >
                      {idx + 1}번: {val || '___'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Word Options */}
              <div className="pt-1">
                <p className="text-[10px] text-slate-400 font-bold mb-1.5">아래 보기 단어를 순서대로 누르세요:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {blankCandidateOptions.map((opt, idx) => {
                    const isUsed = blankSelectedWords.includes(opt);
                    return (
                      <button
                        key={idx}
                        disabled={isUsed}
                        onClick={() => handleSelectBlankCandidate(opt)}
                        className={`p-3 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer text-center active:scale-95 min-h-[44px] ${
                          isUsed
                            ? 'bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
                            : 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-amber-500/10 text-white shadow'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleVerifyBlankFill}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer active:scale-95 shadow-lg"
                >
                  정답 확인하기 (+{pointsReward}점)
                </button>
              </div>
            </div>
          )}

          {/* ---------------- LEVEL 1: REFERENCE MATCH ---------------- */}
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

        {/* Feedback Message Banner */}
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
