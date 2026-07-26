import React from 'react';
import { X, Printer, Award, Sparkles, ShieldCheck } from 'lucide-react';

interface CertificateModalProps {
  studentName: string;
  grade: string;
  completedCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  grade,
  completedCount,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative text-white flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate Printable Canvas Box */}
        <div className="w-full bg-amber-50/95 text-slate-900 p-8 md:p-10 rounded-2xl border-8 border-double border-amber-600 shadow-2xl relative my-2 text-center print:border-amber-600 print:p-8">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-2xl text-amber-700">📜</div>
          <div className="absolute top-2 right-2 text-2xl text-amber-700">📜</div>
          <div className="absolute bottom-2 left-2 text-2xl text-amber-700">🕊️</div>
          <div className="absolute bottom-2 right-2 text-2xl text-amber-700">👑</div>

          <div className="inline-block bg-amber-200 text-amber-900 font-bold px-4 py-1 rounded-full text-xs mb-3 border border-amber-400">
            2026 초등부 말씀 암송 대회
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-black text-amber-950 tracking-wider mb-2">
            말 씀 암 송 수 료 증
          </h1>
          <p className="text-xs text-amber-800 tracking-widest font-bold mb-6">
            CERTIFICATE OF HOLY BIBLE RECITATION
          </p>

          <div className="bg-white/80 p-4 rounded-xl border border-amber-300 max-w-md mx-auto mb-6">
            <span className="text-sm font-bold text-amber-900">
              소속 및 성명: {grade} <span className="text-lg font-black underline ml-1">{studentName}</span>
            </span>
          </div>

          <p className="text-sm md:text-base font-serif leading-relaxed text-amber-950 mb-8 max-w-lg mx-auto">
            위 학생은 2026년도 초등부 말씀 암송 프로그램에서
            <br />
            하나님의 귀한 말씀 <strong>총 {completedCount}구절</strong>을 마음에 새기고,
            <br />
            <strong>‘약속의 땅’으로 향하는 믿음의 여정</strong>을 주님의 은혜로 훌륭하게 완성하였으므로
            이 수료증을 수여합니다.
          </p>

          <p className="text-xs font-serif text-amber-800 mb-8">
            "주의 말씀은 내 발에 등이요 내 길에 빛이니이다" (시편 119:105)
          </p>

          <div className="text-xs font-bold text-amber-900 space-y-1">
            <p>{todayStr}</p>
            <p className="text-sm font-black pt-2">대한예수교장로회 초등부 말씀암송위원회</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-4 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition text-xs cursor-pointer"
          >
            닫기
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>수료증 인쇄하기 / PDF 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
