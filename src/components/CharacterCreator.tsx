import React, { useState } from 'react';
import { CharacterPreset, Grade, PlayerStats } from '../types';
import { CHARACTER_PRESETS } from '../utils/spriteGenerator';
import { SpriteCanvas } from './SpriteCanvas';
import { Sparkles, UserCheck, Shield, ChevronRight } from 'lucide-react';

interface CharacterCreatorProps {
  onStartGame: (player: PlayerStats) => void;
  onOpenQRModal: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onStartGame,
  onOpenQRModal,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>('5학년');
  const [selectedPreset, setSelectedPreset] = useState<CharacterPreset>(CHARACTER_PRESETS[0]);

  // Customizable features
  const [hairColor, setHairColor] = useState(selectedPreset.hairColor);
  const [outfitColor, setOutfitColor] = useState(selectedPreset.outfitColor);
  const [hatType, setHatType] = useState(selectedPreset.hatType);
  const [accessory, setAccessory] = useState(selectedPreset.accessory);

  const handleSelectPreset = (preset: CharacterPreset) => {
    setSelectedPreset(preset);
    setHairColor(preset.hairColor);
    setOutfitColor(preset.outfitColor);
    setHatType(preset.hatType);
    setAccessory(preset.accessory);
  };

  const currentCharacterConfig: CharacterPreset = {
    ...selectedPreset,
    hairColor,
    outfitColor,
    hatType,
    accessory,
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const studentName = name.trim() || '믿음의 용사';

    const newPlayer: PlayerStats = {
      id: 'player_' + Date.now(),
      name: studentName,
      grade,
      character: currentCharacterConfig,
      completedVerseIds: [],
      score: 0,
      streak: 0,
      equippedItems: [],
      itemsUnlocked: [],
      lastActive: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      currentStage: 1,
    };

    onStartGame(newPlayer);
  };

  const HAIR_COLORS = ['#4A2E1A', '#1E1B18', '#D97706', '#E0E0E0', '#DC2626', '#312E81', '#059669'];
  const OUTFIT_COLORS = ['#2B5797', '#9C27B0', '#059669', '#DB2777', '#2563EB', '#0D9488', '#7C3AED', '#D97706'];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-2 sm:p-4 relative overflow-y-auto overscroll-contain touch-pan-y">
      {/* Background decoration gradient and floating stars */}
      <div className="absolute inset-0 bg-radial from-amber-900/30 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20">
        <button
          onClick={onOpenQRModal}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl shadow-lg transition text-xs sm:text-sm cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>초대 QR 코드</span>
        </button>
      </div>

      {/* Top Banner for Mobile/iOS Standalone Launch & Anti-Cookie-Block */}
      <div className="relative z-10 w-full max-w-4xl bg-slate-800/90 border border-emerald-500/50 rounded-2xl p-3 sm:p-4 mb-3 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">📱</span>
          <div>
            <div className="text-xs sm:text-sm font-extrabold text-emerald-400">
              아이폰/모바일 쿠키 차단 해결 (노로그인 무계정 접속)
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300">
              로그인 없이 이름만 입력하면 접속됩니다. 아이폰 Safari 사용자는 [새 창으로 전체화면 열기]를 누르면 쾌적하게 플레이할 수 있습니다.
            </p>
          </div>
        </div>

        <a
          href={typeof window !== 'undefined' ? window.location.href : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-lg transition active:scale-95 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>📱 새 창(전체화면)으로 열기</span>
        </a>
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-slate-800/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md my-2 sm:my-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
            <Shield className="w-4 h-4" /> 초등부 말씀 암송 메타버스 (로그인 없이 즉시 참여)
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight mb-2">
            ‘약속의 땅’으로 향하는 ‘믿음의 여정’
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base">
            별도의 회원가입/비밀번호 없이 내 이름만 적으면 즉시 캐릭터가 생성됩니다!
          </p>
        </div>

        <form onSubmit={handleStart} className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column: Player Info & Character Preview */}
          <div className="md:col-span-5 flex flex-col items-center bg-slate-900/80 rounded-2xl p-4 sm:p-6 border border-slate-700/80">
            <h2 className="text-base sm:text-lg font-bold text-amber-300 mb-3 sm:mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" /> 내 캐릭터 아바타
            </h2>

            {/* Sprite Animated Preview */}
            <div className="relative bg-slate-950/80 rounded-2xl border-2 border-amber-500/40 p-4 mb-4 w-36 h-36 sm:w-44 sm:h-44 flex flex-col items-center justify-center shadow-inner group">
              <SpriteCanvas
                preset={currentCharacterConfig}
                size={84}
                animated={true}
                direction="down"
              />
              <span className="absolute bottom-2 text-[11px] sm:text-xs text-amber-300 font-medium bg-slate-900/80 px-2 py-0.5 rounded-full">
                {currentCharacterConfig.title}
              </span>
            </div>

            {/* Name Input */}
            <div className="w-full mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  학생 이름 (성함 및 반)
                </label>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  로그인 불필요
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김믿음 (5학년 1반)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-semibold"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-medium self-center">빠른선택:</span>
                {['김믿음', '이신앙', '박소망', '최사랑', '한은혜'].map((quickName) => (
                  <button
                    key={quickName}
                    type="button"
                    onClick={() => setName(quickName)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2 py-1 rounded-lg transition cursor-pointer active:scale-95"
                  >
                    {quickName}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-300 mb-1">학년 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {(['4학년', '5학년', '6학년'] as Grade[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer active:scale-95 min-h-[44px] ${
                      grade === g
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Presets & Customizer */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 mb-2 sm:mb-3">1. 성경 인물 프리셋 선택</h3>
              <div className="grid grid-cols-4 gap-2 mb-4 sm:mb-6">
                {CHARACTER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer active:scale-95 ${
                      selectedPreset.id === p.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <SpriteCanvas preset={p} size={32} animated={false} />
                    <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight truncate w-full">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Color & Outfit Customizer */}
              <h3 className="text-xs sm:text-sm font-bold text-slate-200 mb-2 sm:mb-3">2. 커스텀 꾸미기</h3>
              <div className="space-y-3 sm:space-y-4 bg-slate-900/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800 mb-4 sm:mb-6">
                {/* Hair Color */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold mb-1.5 block">머리 색상</span>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHairColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition cursor-pointer active:scale-95 ${
                          hairColor === c ? 'scale-110 border-amber-400 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Outfit Color */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold mb-1.5 block">의상 색상</span>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setOutfitColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition cursor-pointer active:scale-95 ${
                          outfitColor === c ? 'scale-110 border-amber-400 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hat Selection */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold mb-1.5 block">모자/면류관</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { id: 'none', label: '없음' },
                      { id: 'crown', label: '👑 면류관' },
                      { id: 'helmet', label: '🪖 투구' },
                      { id: 'turban', label: '👳 터번' },
                      { id: 'pirate_hat', label: '🎩 모험 모자' },
                      { id: 'ribbon', label: '🎀 리본' },
                    ].map((hat) => (
                      <button
                        key={hat.id}
                        type="button"
                        onClick={() => setHatType(hat.id as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 min-h-[36px] ${
                          hatType === hat.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {hat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessory Selection */}
                <div>
                  <span className="text-xs text-slate-400 font-semibold mb-1.5 block">무기/장비 아이템</span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { id: 'none', label: '맨손' },
                      { id: 'staff', label: '🪄 지팡이' },
                      { id: 'sword', label: '⚔️ 성령의 검' },
                      { id: 'shield', label: '🛡️ 믿음의 방패' },
                      { id: 'harp', label: '🎼 찬양 수금' },
                      { id: 'scroll', label: '📜 말씀 두루마리' },
                      { id: 'branch', label: '🌿 감람나무 가지' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccessory(acc.id as any)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 min-h-[36px] ${
                          accessory === acc.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-3.5 sm:py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg transition cursor-pointer active:scale-95 min-h-[50px]"
            >
              <span>‘약속의 땅’ 여정 시작하기</span>
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
