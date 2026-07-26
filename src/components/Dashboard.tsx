import React, { useState } from 'react';
import { PlayerStats, LeaderboardEntry } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { SpriteCanvas } from './SpriteCanvas';
import { CHARACTER_PRESETS } from '../utils/spriteGenerator';
import {
  Trophy,
  Award,
  Users,
  CheckCircle2,
  X,
  Printer,
  Sparkles,
  BarChart2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface DashboardProps {
  player: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificate: (studentName: string, grade: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  player,
  isOpen,
  onClose,
  onOpenCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'teacher_admin' | 'verse_matrix'>('leaderboard');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('전체');
  const [selectedStudentForMatrix, setSelectedStudentForMatrix] = useState<LeaderboardEntry | null>(null);

  // Simulated Leaderboard & Roster Data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const list: LeaderboardEntry[] = [
      {
        rank: 1,
        id: player.id,
        name: player.name,
        grade: player.grade,
        characterName: player.character.name,
        completedCount: player.completedVerseIds.length,
        score: player.score,
        streak: player.streak,
        equippedItemCount: player.equippedItems.length,
        avatarConfig: player.character,
      },
      {
        rank: 2,
        id: 'p2',
        name: '박여호수아',
        grade: '6학년',
        characterName: '여호수아',
        completedCount: 28,
        score: 4200,
        streak: 12,
        equippedItemCount: 5,
        avatarConfig: CHARACTER_PRESETS[0],
      },
      {
        rank: 3,
        id: 'p3',
        name: '김믿음',
        grade: '5학년',
        characterName: '다윗',
        completedCount: 24,
        score: 3600,
        streak: 8,
        equippedItemCount: 4,
        avatarConfig: CHARACTER_PRESETS[2],
      },
      {
        rank: 4,
        id: 'p4',
        name: '이신앙',
        grade: '4학년',
        characterName: '에스더',
        completedCount: 20,
        score: 3100,
        streak: 6,
        equippedItemCount: 4,
        avatarConfig: CHARACTER_PRESETS[3],
      },
      {
        rank: 5,
        id: 'p5',
        name: '최사무엘',
        grade: '5학년',
        characterName: '모세',
        completedCount: 16,
        score: 2400,
        streak: 5,
        equippedItemCount: 3,
        avatarConfig: CHARACTER_PRESETS[1],
      },
      {
        rank: 6,
        id: 'p6',
        name: '한한나',
        grade: '4학년',
        characterName: '마리아',
        completedCount: 14,
        score: 2100,
        streak: 4,
        equippedItemCount: 2,
        avatarConfig: CHARACTER_PRESETS[4],
      },
      {
        rank: 7,
        id: 'p7',
        name: '정바울',
        grade: '6학년',
        characterName: '바울',
        completedCount: 32,
        score: 4800,
        streak: 15,
        equippedItemCount: 6,
        avatarConfig: CHARACTER_PRESETS[5],
      },
    ];

    return list.sort((a, b) => b.score - a.score).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  });

  const handleAwardBonusPoints = (studentId: string) => {
    setLeaderboard((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, score: item.score + 100 } : item))
    );
  };

  const filteredLeaderboard = leaderboard.filter((item) => {
    if (selectedGradeFilter === '전체') return true;
    return item.grade === selectedGradeFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-amber-300">
                암송 현황 & 순위 대시보드
              </h2>
              <p className="text-xs text-slate-400">
                약속의 땅으로 향하는 학생들의 36구절 암송 달성도와 순위입니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>실시간 학생 순위표</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher_admin')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'teacher_admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>🏫 교사 전용 관리 대시보드</span>
          </button>

          <button
            onClick={() => setActiveTab('verse_matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verse_matrix'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>내 36구절 매트릭스</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Users className="w-8 h-8 text-amber-400" />
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">총 참여 학생</span>
                  <span className="text-xl font-extrabold text-white">{leaderboard.length}명</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">내 완송 구절</span>
                  <span className="text-xl font-extrabold text-emerald-400">
                    {player.completedVerseIds.length} / 36구절
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">암송 수료증</span>
                  <button
                    onClick={() => onOpenCertificate(player.name, player.grade)}
                    className="text-xs font-extrabold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>수료증 미리보기</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="space-y-2">
              {leaderboard.map((item) => {
                const isCurrentPlayer = item.id === player.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                      isCurrentPlayer
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          item.rank === 1
                            ? 'bg-amber-400 text-slate-950'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <SpriteCanvas preset={item.avatarConfig} size={32} animated={false} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">{item.name}</span>
                          <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                            {item.grade}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          인물: {item.characterName} | 완송: {item.completedCount}구절
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-amber-400 block">
                        {item.score}점
                      </span>
                      <span className="text-[10px] text-slate-400">
                        🔥 {item.streak}연속 성공
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TEACHER ADMIN DASHBOARD */}
        {activeTab === 'teacher_admin' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Top Admin Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    교사 모드 활성화됨
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    초등부 암송 지도를 위한 전용 학생 대시보드
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  학생별 암송 진도 확인, 칭찬 보너스 점수 지급 및 완송 수료증 발급이 가능합니다.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>학급 암송 현황표 인쇄</span>
              </button>
            </div>

            {/* Grade Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300">학년 필터:</span>
              {['전체', '4학년', '5학년', '6학년'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedGradeFilter === g
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Class Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">등록 학생 수</span>
                <span className="text-lg font-black text-amber-300">{filteredLeaderboard.length}명</span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">평균 암송 구절</span>
                <span className="text-lg font-black text-emerald-400">
                  {(
                    filteredLeaderboard.reduce((acc, cur) => acc + cur.completedCount, 0) /
                    (filteredLeaderboard.length || 1)
                  ).toFixed(1)}
                  구절
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">최다 완송 학생</span>
                <span className="text-sm font-black text-amber-400 truncate block">
                  {filteredLeaderboard[0]?.name || '없음'} ({filteredLeaderboard[0]?.completedCount || 0}구절)
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-bold block">학급 전체 진도율</span>
                <span className="text-lg font-black text-sky-400">
                  {Math.round(
                    (filteredLeaderboard.reduce((acc, cur) => acc + cur.completedCount, 0) /
                      (filteredLeaderboard.length * 36 || 1)) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="space-y-2">
              {filteredLeaderboard.map((student) => (
                <div
                  key={student.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <SpriteCanvas preset={student.avatarConfig} size={36} animated={false} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{student.name}</span>
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          {student.grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>완송: <strong className="text-emerald-400">{student.completedCount}/36구절</strong></span>
                        <span>• 점수: <strong className="text-amber-400">{student.score}점</strong></span>
                        <span>• 연속: <strong className="text-amber-300">🔥 {student.streak}회</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Action Buttons for this student */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedStudentForMatrix(student)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                      <span>36구절 현황</span>
                    </button>

                    <button
                      onClick={() => handleAwardBonusPoints(student.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold transition cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>+100점 칭찬</span>
                    </button>

                    <button
                      onClick={() => onOpenCertificate(student.name, student.grade)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>수료증 발급</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VERSE MATRIX (36 Verses Grid) */}
        {activeTab === 'verse_matrix' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <h3 className="text-xs font-bold text-slate-300 mb-3">
              36구절 암송 매트릭스 (완성된 구절은 초록색 체크로 표시됩니다)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {BIBLE_VERSES.map((v) => {
                const isDone = player.completedVerseIds.includes(v.id);

                return (
                  <div
                    key={v.id}
                    className={`p-3 rounded-2xl border text-left transition ${
                      isDone
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-400">#{v.id} {v.dateRange}</span>
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="text-xs font-extrabold block truncate text-slate-100 mb-1">
                      {v.reference}
                    </span>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">{v.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
        >
          닫기
        </button>

        {/* Sub-Modal: Selected Student 36-Verse Matrix Inspection */}
        {selectedStudentForMatrix && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border-2 border-sky-500/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative text-white max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <SpriteCanvas preset={selectedStudentForMatrix.avatarConfig} size={32} animated={false} />
                  <div>
                    <h3 className="font-extrabold text-base text-sky-300">
                      {selectedStudentForMatrix.name} ({selectedStudentForMatrix.grade}) 36구절 암송 현황표
                    </h3>
                    <p className="text-xs text-slate-400">
                      총 36구절 중 {selectedStudentForMatrix.completedCount}구절 완송 달성
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentForMatrix(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1">
                {BIBLE_VERSES.map((v) => {
                  const isDone =
                    selectedStudentForMatrix.id === player.id
                      ? player.completedVerseIds.includes(v.id)
                      : v.id <= selectedStudentForMatrix.completedCount;

                  return (
                    <div
                      key={v.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        isDone
                          ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>미션 #{v.id}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span className="text-[10px]">미완송</span>
                        )}
                      </div>
                      <div className="font-semibold truncate text-[11px] text-slate-300">
                        {v.reference}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setSelectedStudentForMatrix(null)}
                className="mt-4 w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
