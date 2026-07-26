import React, { useState } from 'react';
import { X, Printer, Award, Sparkles, Users, CheckCircle2 } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface CertificateModalProps {
  studentName: string;
  grade: string;
  completedCount: number;
  isOpen: boolean;
  onClose: () => void;
  allStudents?: LeaderboardEntry[];
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  grade,
  completedCount,
  isOpen,
  onClose,
  allStudents,
}) => {
  if (!isOpen) return null;

  // Print Mode: 'SINGLE' or 'ALL'
  const [printMode, setPrintMode] = useState<'SINGLE' | 'ALL'>(
    allStudents && allStudents.length > 1 ? 'ALL' : 'SINGLE'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const studentsToRender =
    printMode === 'ALL' && allStudents && allStudents.length > 0
      ? allStudents
      : [
          {
            id: 'single',
            name: studentName,
            grade: grade,
            completedCount: completedCount,
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-1.5 sm:p-4 touch-pan-y overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-3 sm:p-6 md:p-8 max-w-3xl w-full max-h-[92vh] landscape:max-h-[96vh] overflow-y-auto overscroll-contain touch-pan-y shadow-2xl relative text-white flex flex-col items-center my-auto print:border-none print:shadow-none print:bg-transparent print:p-0 print:max-h-none print:w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer print:hidden z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Print Mode Selector Bar (If multiple participants available) */}
        {allStudents && allStudents.length > 0 && (
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 mb-3 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">수료증 출력 범위 선택</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintMode('SINGLE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  printMode === 'SINGLE'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                단일 수료증 ({studentName})
              </button>
              <button
                onClick={() => setPrintMode('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  printMode === 'ALL'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>참가자 전원 일괄 출력 ({allStudents.length}명)</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Header in Screen Mode */}
        <div className="w-full text-center mb-2 print:hidden">
          <h2 className="text-lg sm:text-xl font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>
              {printMode === 'ALL' && allStudents
                ? `참가 학생 전원 수료증 (${allStudents.length}장)`
                : `${studentName} 어린이 수료증`}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            [수료증 인쇄하기] 버튼을 누르면 모든 페이지가 선명하게 인쇄 및 PDF 저장됩니다.
          </p>
        </div>

        {/* Certificate Render Loop */}
        <div className="w-full space-y-8 print:space-y-0">
          {studentsToRender.map((st, index) => (
            <div
              key={st.id || index}
              className="w-full bg-amber-50/95 text-slate-900 p-6 sm:p-8 md:p-10 rounded-2xl border-8 border-double border-amber-600 shadow-2xl relative my-2 text-center print:border-amber-600 print:p-8 print:shadow-none print:my-0 print:break-after-page print:page-break-after-always"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 text-xl sm:text-2xl text-amber-700">📜</div>
              <div className="absolute top-2 right-2 text-xl sm:text-2xl text-amber-700">📜</div>
              <div className="absolute bottom-2 left-2 text-xl sm:text-2xl text-amber-700">🕊️</div>
              <div className="absolute bottom-2 right-2 text-xl sm:text-2xl text-amber-700">👑</div>

              <div className="inline-block bg-amber-200 text-amber-900 font-bold px-3.5 py-1 rounded-full text-xs mb-2.5 border border-amber-400">
                2026 초등부 말씀 암송 대회
              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-black text-amber-950 tracking-wide mb-1">
                Promise Land 암송아지 수료증
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-800 tracking-widest font-bold mb-5">
                CERTIFICATE OF HOLY BIBLE RECITATION
              </p>

              <div className="bg-white/80 p-3.5 rounded-xl border border-amber-300 max-w-md mx-auto mb-5">
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  소속 및 성명: {st.grade} <span className="text-base sm:text-lg font-black underline ml-1">{st.name}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm md:text-base font-serif leading-relaxed text-amber-950 mb-6 max-w-lg mx-auto">
                위 학생은 2026년도 초등부 말씀 암송 프로그램에서
                <br />
                하나님의 귀한 말씀 <strong>총 {st.completedCount}구절</strong>을 마음에 새기고,
                <br />
                <strong>‘약속의 땅’으로 향하는 믿음의 여정</strong>을 주님의 은혜로 훌륭하게 완성하였으므로
                이 수료증을 수여합니다.
              </p>

              <p className="text-[11px] sm:text-xs font-serif text-amber-800 mb-6">
                "주의 말씀은 내 발에 등이요 내 길에 빛이니이다" (시편 119:105)
              </p>

              <div className="text-[11px] sm:text-xs font-bold text-amber-900 space-y-0.5">
                <p>{todayStr}</p>
                <p className="text-xs sm:text-sm font-black pt-1.5">대한예수교장로회 장충교회 초등부 Promise Land</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-3 w-full mt-4 print:hidden sticky bottom-0 bg-slate-900/90 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition text-xs sm:text-sm cursor-pointer min-h-[44px]"
          >
            닫기
          </button>
          <button
            onClick={handlePrint}
            className="flex-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>
              {printMode === 'ALL' && allStudents
                ? `참가자 전원 (${allStudents.length}명) 수료증 일괄 인쇄 / PDF`
                : '수료증 인쇄하기 / PDF 저장'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

