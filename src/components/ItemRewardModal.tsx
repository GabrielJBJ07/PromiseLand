import React from 'react';
import { GameItem } from '../types';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ShieldCheck, ChevronRight } from 'lucide-react';

interface ItemRewardModalProps {
  item: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEquipItem: (itemId: string) => void;
}

export const ItemRewardModal: React.FC<ItemRewardModalProps> = ({
  item,
  isOpen,
  onClose,
  onEquipItem,
}) => {
  if (!isOpen || !item) return null;

  const handleEquip = () => {
    onEquipItem(item.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 touch-pan-y overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[88vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y shadow-2xl relative text-white text-center my-auto">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1 rounded-full text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{item.milestoneVerseCount}구절 완송 보상 달성!</span>
        </div>

        <div className="text-6xl my-4 animate-pulse">{item.icon}</div>

        <h2 className="text-2xl font-extrabold text-amber-400 mb-2">{item.name}</h2>
        <p className="text-slate-300 text-xs md:text-sm mb-4 leading-relaxed">{item.description}</p>

        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 mb-6 shadow-inner">
          <span className="text-[11px] font-bold text-amber-400 block mb-1">획득 능력치 효과</span>
          <p className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{item.effectText}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition text-xs cursor-pointer"
          >
            가방에 보관
          </button>
          <button
            onClick={handleEquip}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>즉시 장착하기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
