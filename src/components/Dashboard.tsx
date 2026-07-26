import React, { useState } from 'react';
import { PlayerStats, LeaderboardEntry } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { SpriteCanvas } from './SpriteCanvas';
import {
  Trophy,
  Users,
  CheckCircle2,
  X,
  Printer,
  BarChart2,
  Trash2,
  AlertTriangle,
  UserPlus,
  QrCode,
} from 'lucide-react';

interface DashboardProps {
  player: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificate: (studentName: string, grade: string) => void;
  joinedStudents: LeaderboardEntry[];
  onAddDemoStudent?: () => void;
  onRemoveStudent?: (studentId: string) => void;
  onOpenQRModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  player,
  isOpen,
  onClose,
  onOpenCertificate,
  joinedStudents,
  onAddDemoStudent,
  onRemoveStudent,
  onOpenQRModal,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'teacher_admin' | 'verse_matrix'>('leaderboard');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('전체');
  const [selectedStudentForMatrix, setSelectedStudentForMatrix] = useState<LeaderboardEntry | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<LeaderboardEntry | null>(null);

  // Compute leaderboard with ranks
  const sortedLeaderboard = [...joinedStudents]
    .sort((a, b) => b.completedCount - a.completedCount || b.score - a.score)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const filteredLeaderboard = sortedLeaderboard.filter((item) => {
    if (selectedGradeFilter === '전체') return true;
    return item.grade === selectedGradeFilter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-1.5 sm:p-4 touch-pan-y overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-3 sm:p-6 md:p-8 max-w-4xl w-full shadow-2xl relative text-white flex flex-col max-h-[88vh] sm:max-h-[92vh] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 sm:pb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2 sm:p-2.5 rounded-2xl border border-amber-500/30 shrink-0">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-amber-300">
                암송 현황 & 실시간 대시보드
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
                스마트폰 QR 접속으로 참가한 학생들의 36구절 암송 진도 현황입니다. (현재 {joinedStudents.length}명 참여 중)
              </p>
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

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>실시간 학생 순위표</span>
            </button>

            <button
              onClick={() => setActiveTab('teacher_admin')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === 'teacher_admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>🏫 교사 전용 관리</span>
            </button>

            <button
              onClick={() => setActiveTab('verse_matrix')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                activeTab === 'verse_matrix'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>36구절 암송 현황표</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQRModal}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>학생 초대 QR</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REALTIME LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-3 pr-1">
            {/* Grade Filters */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-300">학년 필터:</span>
                {['전체', '4학년', '5학년', '6학년'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGradeFilter(g)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
                      selectedGradeFilter === g
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {onAddDemoStudent && (
                <button
                  onClick={onAddDemoStudent}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3 h-3 text-emerald-400" />
                  <span>시뮬레이션 학생 추가</span>
                </button>
              )}
            </div>

            {/* Leaderboard Items */}
            {filteredLeaderboard.length > 0 ? (
              <div className="space-y-2">
                {filteredLeaderboard.map((item) => {
                  const isMe = item.id === player.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition ${
                        isMe
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                            item.rank === 1
                              ? 'bg-amber-500 text-slate-950'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.rank}위
                        </div>

                        {/* Avatar */}
                        <div className="shrink-0">
                          <SpriteCanvas preset={item.avatarConfig} size={32} animated={false} />
                        </div>

                        {/* Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{item.name}</span>
                            <span className="bg-slate-800 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                              {item.grade}
                            </span>
                            {isMe && (
                              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                                나
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>캐릭터: {item.characterName}</span>
                            <span>•</span>
                            <span>연속 {item.streak}일</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="text-right">
                        <div className="text-amber-300 font-extrabold text-xs sm:text-sm">
                          암송 {item.completedCount}/36 구절
                        </div>
                        <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                          {item.score}점
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                아직 입장한 학생이 없습니다. 상단 '학생 초대 QR' 버튼으로 QR코드를 보여주고 학생들을 참여시켜보세요!
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEACHER ADMIN & CERTIFICATE PRINTING */}
        {activeTab === 'teacher_admin' && (
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-4 pr-1">
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 sm:p-4 rounded-2xl text-xs text-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold block mb-1">🏫 초등부 담당 교사 전용 실시간 현황:</span>
                학생들이 QR로 입장하여 암송을 진행하는 현황을 실시간 확인하고 완송 수료증을 출력할 수 있습니다.
              </div>
              {onAddDemoStudent && (
                <button
                  onClick={onAddDemoStudent}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 ml-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>테스트 학생 추가</span>
                </button>
              )}
            </div>

            {/* Roster Table for Teachers */}
            {joinedStudents.length > 0 ? (
              <div className="space-y-2">
                {joinedStudents.map((student) => {
                  const isFinishedAll = student.completedCount >= 36;

                  return (
                    <div
                      key={student.id}
                      className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl hover:border-emerald-500/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <SpriteCanvas preset={student.avatarConfig} size={32} animated={false} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white">{student.name}</span>
                            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                              {student.grade}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            진도율: {student.completedCount}/36 구절 ({Math.round((student.completedCount / 36) * 100)}%)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudentForMatrix(student);
                            setActiveTab('verse_matrix');
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition cursor-pointer active:scale-95"
                        >
                          암송표 확인
                        </button>

                        <button
                          onClick={() => onOpenCertificate(student.name, student.grade)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer active:scale-95 ${
                            isFinishedAll
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>수료증 출력</span>
                        </button>

                        {onRemoveStudent && student.id !== player.id && (
                          <button
                            onClick={() => setStudentToDelete(student)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer active:scale-95"
                            title="학생 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                현재 입장한 학생이 없습니다. 학생용 QR 코드를 보여주고 접속을 안내하세요.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 36 BIBLE VERSE MATRIX */}
        {activeTab === 'verse_matrix' && (
          <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-4 pr-1">
            <div className="flex items-center justify-between bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800">
              <div className="text-xs font-bold text-amber-300">
                📌 {selectedStudentForMatrix ? `${selectedStudentForMatrix.name} 학생의` : '나의'} 36구절 암송 완료 체크표
              </div>
              {selectedStudentForMatrix && (
                <button
                  onClick={() => setSelectedStudentForMatrix(null)}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  내 암송표로 보기
                </button>
              )}
            </div>

            {/* 36 Grid Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {BIBLE_VERSES.map((verse) => {
                const targetCompletedIds = selectedStudentForMatrix
                  ? Array.from({ length: selectedStudentForMatrix.completedCount }, (_, i) => i + 1)
                  : player.completedVerseIds;

                const isDone = targetCompletedIds.includes(verse.id);

                return (
                  <div
                    key={verse.id}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-between h-24 ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>#{verse.id}</span>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span>미완료</span>}
                    </div>

                    <div className="font-extrabold text-xs text-amber-200 truncate mt-1">
                      {verse.reference}
                    </div>

                    <div className="text-[9px] truncate text-slate-400 mt-1">
                      {verse.keywords.join(', ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
            <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="font-extrabold text-lg text-white">학생 명단 삭제</h3>
              <p className="text-xs text-slate-300">
                정말로 '<span className="text-rose-300 font-bold">{studentToDelete.name}</span>' 학생 정보를 목록에서 삭제하시겠습니까?
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setStudentToDelete(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    if (onRemoveStudent) onRemoveStudent(studentToDelete.id);
                    setStudentToDelete(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  삭제 확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
