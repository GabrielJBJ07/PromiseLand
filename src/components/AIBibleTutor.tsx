import React, { useState } from 'react';
import { BibleVerse } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { X, Sparkles, Send, BookOpen, Heart, Bot } from 'lucide-react';

interface AIBibleTutorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIBibleTutor: React.FC<AIBibleTutorProps> = ({ isOpen, onClose }) => {
  const [selectedVerseId, setSelectedVerseId] = useState<number>(1);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentVerse = BIBLE_VERSES.find((v) => v.id === selectedVerseId) || BIBLE_VERSES[0];

  const handleAskAI = async (customPrompt?: string) => {
    const promptToUse = customPrompt || question || `[${currentVerse.reference}] "${currentVerse.text}" 구절의 뜻과 암송 팁을 초등학생 눈높이에 맞게 설명해줘.`;
    setIsLoading(true);
    setAiResponse('');

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse, verse: currentVerse }),
      });
      const data = await res.json();
      setAiResponse(data.reply || '말씀을 묵상하며 즐겁게 암송해보세요!');
    } catch (err) {
      console.error(err);
      // Friendly fallback offline explanation if network or key is unavailable
      setAiResponse(
        `💡 [${currentVerse.reference}] 은(는) "${currentVerse.theme}"에 대한 아주 귀한 말씀입니다!\n\n` +
        `이 말씀을 잘 외우는 팁:\n` +
        `1. 먼저 큰 소리로 3번 천천히 따라 읽어보세요.\n` +
        `2. '${currentVerse.keywords.join(', ')}' 핵심 단어부터 마음에 기억하세요!\n` +
        `3. 하루에 3번씩 기도하는 마음으로 읊조리면 약속의 땅 가나안으로 한 걸음 더 나아갈 수 있습니다. 🌟`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 text-purple-300 p-2.5 rounded-2xl border border-purple-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-300">AI 말씀 가이드 튜터</h2>
              <p className="text-xs text-slate-400">구절의 뜻과 암송 비법을 친절하게 알려줍니다!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Verse Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-1">질문할 말씀 구절 선택</label>
          <select
            value={selectedVerseId}
            onChange={(e) => setSelectedVerseId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
          >
            {BIBLE_VERSES.map((v) => (
              <option key={v.id} value={v.id}>
                #{v.id} [{v.reference}] - {v.theme}
              </option>
            ))}
          </select>
        </div>

        {/* Verse Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 text-xs">
          <p className="text-amber-200 font-bold mb-1">[{currentVerse.reference}]</p>
          <p className="text-slate-300 leading-relaxed">"{currentVerse.text}"</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleAskAI()}
            className="flex-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 font-bold py-2 px-3 rounded-xl text-xs transition cursor-pointer"
          >
            💡 구절 뜻과 암송 팁 물어보기
          </button>
        </div>

        {/* AI Answer Box */}
        {isLoading ? (
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center text-xs text-purple-300 animate-pulse my-4">
            ✨ AI 말씀 튜터가 친절하게 설명을 작성하는 중입니다...
          </div>
        ) : (
          aiResponse && (
            <div className="bg-purple-950/40 border border-purple-500/30 p-4 rounded-2xl text-xs text-purple-100 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto my-4">
              {aiResponse}
            </div>
          )
        )}

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};
