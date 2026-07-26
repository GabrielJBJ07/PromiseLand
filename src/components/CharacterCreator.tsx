import React, { useState } from 'react';
import { CharacterPreset, Grade, PlayerStats } from '../types';
import { CHARACTER_PRESETS } from '../utils/spriteGenerator';
import { SpriteCanvas } from './SpriteCanvas';
import { Sparkles, Shield, ChevronRight, ChevronLeft, Check, Palette, User, Award } from 'lucide-react';

interface CharacterCreatorProps {
  onStartGame: (player: PlayerStats) => void;
  onOpenQRModal: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onStartGame,
  onOpenQRModal,
}) => {
  // Step 1: Name & Grade | Step 2: Preset Selection | Step 3: Custom Outfit/Accessories
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        setName('김믿음');
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      handleStart();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-start sm:justify-center items-center p-2 sm:p-4 relative overflow-y-auto overscroll-contain touch-pan-y">
      {/* Background decoration gradient */}
      <div className="absolute inset-0 bg-radial from-amber-900/30 via-slate-900 to-slate-950 pointer-events-none" />

      {/* QR Code Quick Button */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20">
        <button
          onClick={onOpenQRModal}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl shadow-lg transition text-xs sm:text-sm cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">초대 QR 코드</span>
          <span className="sm:hidden">QR</span>
        </button>
      </div>

      {/* Top Mobile Safari Frame Helper */}
      <div className="relative z-10 w-full max-w-3xl bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 mb-2 sm:mb-3 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-lg">📱</span>
          <div className="text-xs">
            <span className="font-extrabold text-emerald-400">
              로그인 없이 바로 시작하는 어린이 게임
            </span>
            <p className="text-[11px] text-slate-300">
              이름만 적고 단계별로 캐릭터를 꾸며 가나안 복지로 탐험을 떠나세요!
            </p>
          </div>
        </div>

        <a
          href={typeof window !== 'undefined' ? window.location.href : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-md transition active:scale-95 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>📱 새 창(전체화면) 열기</span>
        </a>
      </div>

      {/* Main Stepper Card */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-800/95 border border-amber-500/40 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md my-1">
        {/* Title Header */}
        <div className="text-center mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold mb-1">
            <Shield className="w-3.5 h-3.5" /> 초등부 말씀 암송 메타버스
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold text-amber-400 tracking-tight">
            ‘약속의 땅’ 캐릭터 만들기
          </h1>
          <div className="text-[10px] sm:text-[11px] text-amber-200/80 font-bold mt-0.5">
            개발자: Gabriel Byeongje Jeon
          </div>
        </div>

        {/* STEPPER PROGRESS INDICATOR BAR */}
        <div className="flex items-center justify-between max-w-sm mx-auto mb-3 sm:mb-4 px-1">
          {/* Step 1 Indicator */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex flex-col items-center gap-0.5 flex-1 cursor-pointer transition ${
              currentStep === 1 ? 'text-amber-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 transition ${
                currentStep === 1
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                  : currentStep > 1
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] sm:text-xs">1단계: 이름/학년</span>
          </button>

          <div className={`h-0.5 flex-1 rounded mx-1 transition ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />

          {/* Step 2 Indicator */}
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex flex-col items-center gap-0.5 flex-1 cursor-pointer transition ${
              currentStep === 2 ? 'text-amber-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 transition ${
                currentStep === 2
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                  : currentStep > 2
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : <Award className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] sm:text-xs">2단계: 인물 선택</span>
          </button>

          <div className={`h-0.5 flex-1 rounded mx-1 transition ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-700'}`} />

          {/* Step 3 Indicator */}
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex flex-col items-center gap-0.5 flex-1 cursor-pointer transition ${
              currentStep === 3 ? 'text-amber-400 font-extrabold' : 'text-slate-500'
            }`}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm border-2 transition ${
                currentStep === 3
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30 scale-105'
                  : 'bg-slate-900 text-slate-500 border-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] sm:text-xs">3단계: 커스텀</span>
          </button>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="bg-slate-900/80 rounded-2xl p-3 sm:p-4 border border-slate-700/80 mb-3 min-h-[240px] sm:min-h-[280px] flex flex-col justify-center">
          
          {/* STEP 1: PLAYER NAME & GRADE */}
          {currentStep === 1 && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview Avatar Card */}
              <div className="shrink-0 flex flex-col items-center bg-slate-950/80 rounded-2xl border-2 border-amber-500/40 p-3 w-28 h-28 sm:w-36 sm:h-36 justify-center shadow-inner">
                <SpriteCanvas
                  preset={currentCharacterConfig}
                  size={64}
                  animated={true}
                  direction="down"
                />
                <span className="mt-1 text-[10px] sm:text-[11px] text-amber-300 font-bold bg-slate-900/80 px-2 py-0.5 rounded-full">
                  {currentCharacterConfig.title}
                </span>
              </div>

              {/* Form Inputs */}
              <div className="flex-1 w-full space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs sm:text-sm font-bold text-slate-200">
                      학생 이름 입력
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      로그인 필요없음
                    </span>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름 입력 (예: 김믿음)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-bold shadow-inner"
                    autoFocus
                  />
                </div>

                {/* Grade Selection */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1">학년 선택</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['4학년', '5학년', '6학년'] as Grade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`py-2 rounded-xl text-xs sm:text-sm font-extrabold transition border cursor-pointer active:scale-95 min-h-[42px] ${
                          grade === g
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BIBLE CHARACTER PRESET SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-400" /> 성경 인물 캐릭터를 선택하세요
                </h3>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  대표 인물 8명
                </span>
              </div>

              {/* 4x2 Compact Grid for All 8 Characters */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {CHARACTER_PRESETS.map((p) => {
                  const isSelected = selectedPreset.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center gap-0.5 transition cursor-pointer active:scale-95 text-center min-h-[80px] sm:min-h-[92px] justify-between ${
                        isSelected
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-lg ring-1 ring-amber-400/60'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <SpriteCanvas preset={p} size={36} animated={isSelected} />
                      <div className="w-full">
                        <div className="text-[11px] font-extrabold text-amber-200 truncate">{p.name}</div>
                        <div className="text-[9px] text-slate-400 font-medium truncate">
                          {p.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOM OUTFIT & ACCESSORIES */}
          {currentStep === 3 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              {/* Preview Avatar Card */}
              <div className="shrink-0 flex flex-col items-center bg-slate-950/80 rounded-2xl border border-amber-500/40 p-2.5 w-28 h-28 sm:w-32 sm:h-32 justify-center shadow-inner">
                <SpriteCanvas
                  preset={currentCharacterConfig}
                  size={60}
                  animated={true}
                  direction="down"
                />
                <span className="mt-1 text-[10px] text-amber-300 font-extrabold bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/30 truncate max-w-[100px]">
                  {name || '믿음의 용사'} ({grade})
                </span>
              </div>

              {/* Color & Outfit Customizer Options */}
              <div className="flex-1 w-full space-y-2 text-left">
                {/* Hair Color */}
                <div>
                  <span className="text-[11px] text-slate-300 font-bold mb-1 block">머리 색상</span>
                  <div className="flex flex-wrap gap-1.5">
                    {HAIR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setHairColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer active:scale-95 ${
                          hairColor === c ? 'scale-110 border-amber-400 ring-2 ring-amber-300' : 'border-slate-800'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Outfit Color */}
                <div>
                  <span className="text-[11px] text-slate-300 font-bold mb-1 block">의상 색상</span>
                  <div className="flex flex-wrap gap-1.5">
                    {OUTFIT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setOutfitColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer active:scale-95 ${
                          outfitColor === c ? 'scale-110 border-amber-400 ring-2 ring-amber-300' : 'border-slate-800'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hat Selection */}
                <div>
                  <span className="text-[11px] text-slate-300 font-bold mb-1 block">모자/머리장식</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'none', label: '없음' },
                      { id: 'crown', label: '👑 면류관' },
                      { id: 'helmet', label: '🪖 투구' },
                      { id: 'turban', label: '👳 터번' },
                      { id: 'ribbon', label: '🎀 리본' },
                    ].map((hat) => (
                      <button
                        key={hat.id}
                        type="button"
                        onClick={() => setHatType(hat.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer active:scale-95 ${
                          hatType === hat.id
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
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
                  <span className="text-[11px] text-slate-300 font-bold mb-1 block">무기/장비</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'none', label: '맨손' },
                      { id: 'staff', label: '🪄 지팡이' },
                      { id: 'sword', label: '⚔️ 성령의 검' },
                      { id: 'shield', label: '🛡️ 믿음의 방패' },
                      { id: 'harp', label: '🎼 찬양 수금' },
                      { id: 'scroll', label: '📜 두루마리' },
                    ].map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccessory(acc.id as any)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer active:scale-95 ${
                          accessory === acc.id
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
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
          )}
        </div>

        {/* BOTTOM NAVIGATION ACTION BUTTONS */}
        <div className="flex items-center justify-between gap-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-900 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-700 flex items-center gap-1 transition cursor-pointer active:scale-95 text-xs sm:text-sm min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 단계</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-5 rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer active:scale-95 text-xs sm:text-sm min-h-[44px]"
            >
              <span>다음 단계로 이동</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStart()}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/20 border-2 border-emerald-300 flex items-center gap-1.5 transition cursor-pointer active:scale-95 text-xs sm:text-sm animate-pulse min-h-[44px]"
            >
              <span>‘약속의 땅’ 탐험 시작! 🚀</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

