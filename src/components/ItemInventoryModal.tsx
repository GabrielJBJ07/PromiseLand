import React from 'react';
import { PlayerStats } from '../types';
import { GAME_ITEMS } from '../data/items';
import { X, Sparkles, Check, Shield } from 'lucide-react';

interface ItemInventoryModalProps {
  player: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onToggleEquip: (itemId: string) => void;
}

export const ItemInventoryModal: React.FC<ItemInventoryModalProps> = ({
  player,
  isOpen,
  onClose,
  onToggleEquip,
}) => {
  if (!isOpen) return null;

  const completedCount = player.completedVerseIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 touch-manipulation">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 md:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 sm:pb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-300">믿음의 보물 인벤토리</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">5구절 완송 시마다 전신 갑주와 보물이 해금됩니다.</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          {GAME_ITEMS.map((item) => {
            const isUnlocked = completedCount >= item.milestoneVerseCount;
            const isEquipped = player.equippedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                  isUnlocked
                    ? isEquipped
                      ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                      : 'bg-slate-950 border-slate-700 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
                }`}
              >
                <div className="text-3xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-amber-300">{item.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.milestoneVerseCount}구절
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{item.effectText}</p>

                  {isUnlocked && (
                    <button
                      onClick={() => onToggleEquip(item.id)}
                      className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer active:scale-95 min-h-[36px] ${
                        isEquipped
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isEquipped ? <Check className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                      <span>{isEquipped ? '장착 중' : '장착하기'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
