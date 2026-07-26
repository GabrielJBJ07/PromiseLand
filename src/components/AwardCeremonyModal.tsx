import React from 'react';
import { LeaderboardEntry } from '../types';
import { SpriteCanvas } from './SpriteCanvas';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Printer,
  X,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Medal,
  Star,
} from 'lucide-react';

interface AwardCeremonyModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: LeaderboardEntry[];
  onOpenCertificate: (studentName: string, grade: string) => void;
  onResetGame: () => void;
}

export const AwardCeremonyModal: React.FC<AwardCeremonyModalProps> = ({
  isOpen,
  onClose,
  students,
  onOpenCertificate,
  onResetGame,
}) => {
  if (!isOpen) return null;

  // Sort students by completed count descending, then score descending
  const sorted = [...students].sort((a, b) => b.completedCount - a.completedCount || b.score - a.score);

  const firstPlace = sorted[0];
  const secondPlace = sorted[1];
  const thirdPlace = sorted[2];
  const remaining = sorted.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-1.5 sm:p-6 overflow-y-auto touch-pan-y">
      {/* Decorative Fireworks Rays */}
      <div className="absolute inset-0 bg-radial from-amber-500/20 via-slate-950 to-slate-950 pointer-events-none animate-pulse" />

      <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl p-3 sm:p-6 md:p-8 max-w-4xl w-full shadow-2xl relative text-white flex flex-col my-auto max-h-[88vh] sm:max-h-[94vh] overflow-y-auto overscroll-contain touch-pan-y">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Ceremony Header */}
        <div className="text-center mb-6 sm:mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs font-black mb-3 shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>2026 초등부 약속의 땅 암송 대회 시상식</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-300 tracking-tight flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            <span>영광의 1, 2, 3위 수상자 발표</span>
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            ‘약속의 땅’을 향해 신실하게 말씀을 외운 자랑스러운 어린이 용사들입니다!
          </p>
        </div>

        {/* PODIUM VISUAL (단상 시상대 그림) */}
        {sorted.length > 0 ? (
          <div className="relative bg-slate-950/80 border border-amber-500/30 rounded-3xl p-4 sm:p-6 mb-6 shadow-inner flex justify-center items-end min-h-[300px] sm:min-h-[360px] gap-2 sm:gap-6 pt-12 overflow-hidden">
            {/* Ambient Lighting Rays */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 2ND PLACE PODIUM (Left) */}
            <div className="flex flex-col items-center flex-1 max-w-[180px] z-10">
              {secondPlace ? (
                <div className="flex flex-col items-center mb-2 animate-fade-in">
                  <div className="bg-slate-300 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full mb-1 flex items-center gap-1 shadow">
                    <Medal className="w-3 h-3 text-slate-700" /> 2위 (준우승)
                  </div>
                  <div className="relative mb-1">
                    <SpriteCanvas preset={secondPlace.avatarConfig} size={54} animated={true} />
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-200 text-center truncate max-w-[110px]">
                    {secondPlace.name}
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold">
                    {secondPlace.completedCount}구절 ({secondPlace.score}점)
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 mb-4">대기 중</div>
              )}
              {/* Podium Base */}
              <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 border-t-4 border-slate-300 rounded-t-2xl h-28 sm:h-36 flex items-center justify-center shadow-2xl relative">
                <span className="text-3xl sm:text-4xl font-black text-slate-300/60">2</span>
              </div>
            </div>

            {/* 1ST PLACE PODIUM (Center - Highest) */}
            <div className="flex flex-col items-center flex-1 max-w-[210px] z-20 -mt-6">
              {firstPlace ? (
                <div className="flex flex-col items-center mb-2 animate-bounce">
                  <Crown className="w-7 h-7 sm:w-9 sm:h-9 text-amber-400 drop-shadow-lg mb-1" />
                  <div className="bg-amber-400 text-slate-950 text-xs sm:text-sm font-black px-3 py-1 rounded-full mb-1 flex items-center gap-1 shadow-lg border border-amber-300">
                    <Trophy className="w-4 h-4 text-slate-950" /> 1위 (대우승)
                  </div>
                  <div className="relative mb-1 p-1 bg-amber-500/20 rounded-2xl border border-amber-400/50">
                    <SpriteCanvas preset={firstPlace.avatarConfig} size={68} animated={true} />
                  </div>
                  <div className="font-black text-sm sm:text-base text-amber-300 text-center truncate max-w-[130px]">
                    {firstPlace.name}
                  </div>
                  <div className="text-xs text-amber-200 font-extrabold bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-500/40">
                    {firstPlace.completedCount}구절 완송 ({firstPlace.score}점)
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 mb-4">대기 중</div>
              )}
              {/* Podium Base */}
              <div className="w-full bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 border-t-4 border-amber-300 rounded-t-2xl h-36 sm:h-48 flex flex-col items-center justify-center shadow-2xl relative">
                <span className="text-4xl sm:text-5xl font-black text-slate-950/70">1</span>
                <span className="text-[10px] sm:text-xs text-slate-950 font-extrabold mt-1">CHAMPION</span>
              </div>
            </div>

            {/* 3RD PLACE PODIUM (Right) */}
            <div className="flex flex-col items-center flex-1 max-w-[180px] z-10">
              {thirdPlace ? (
                <div className="flex flex-col items-center mb-2 animate-fade-in">
                  <div className="bg-amber-700 text-amber-100 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full mb-1 flex items-center gap-1 shadow">
                    <Medal className="w-3 h-3 text-amber-200" /> 3위 (장려상)
                  </div>
                  <div className="relative mb-1">
                    <SpriteCanvas preset={thirdPlace.avatarConfig} size={50} animated={true} />
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-200 text-center truncate max-w-[110px]">
                    {thirdPlace.name}
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold">
                    {thirdPlace.completedCount}구절 ({thirdPlace.score}점)
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600 mb-4">대기 중</div>
              )}
              {/* Podium Base */}
              <div className="w-full bg-gradient-to-t from-amber-900 to-amber-800 border-t-4 border-amber-600 rounded-t-2xl h-24 sm:h-32 flex items-center justify-center shadow-2xl relative">
                <span className="text-3xl sm:text-4xl font-black text-amber-400/50">3</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950 p-8 rounded-2xl text-center text-slate-400 text-sm mb-6">
            참여한 학생이 없습니다. QR 코드로 학생들을 초대하여 경기를 진행해보세요!
          </div>
        )}

        {/* REMAINING PARTICIPANTS TABLE (4위 이하) */}
        {remaining.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>자랑스러운 참가 학생 명단 ({remaining.length}명)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {remaining.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-400 w-5 text-center">{idx + 4}위</span>
                    <SpriteCanvas preset={student.avatarConfig} size={28} animated={false} />
                    <span className="font-bold text-white">{student.name}</span>
                    <span className="text-[10px] text-slate-400">({student.grade})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-300 font-bold">{student.completedCount}구절</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({student.score}점)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onResetGame}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm transition cursor-pointer active:scale-95 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>새로운 게임 활동 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            {sorted.length > 0 && (
              <button
                onClick={() => onOpenCertificate(sorted[0].name, sorted[0].grade)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-xl transition cursor-pointer active:scale-95 min-h-[44px]"
              >
                <Printer className="w-4 h-4" />
                <span>우승자 수료증 출력</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm transition cursor-pointer active:scale-95 min-h-[44px]"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
