import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PlayerStats, BibleVerse } from '../types';
import { BIBLE_VERSES, STAGES_INFO } from '../data/bibleVerses';
import { drawPixelSprite } from '../utils/spriteGenerator';
import { SpriteCanvas } from './SpriteCanvas';
import { CHARACTER_PRESETS } from '../utils/spriteGenerator';
import {
  BookOpen,
  Trophy,
  Sparkles,
  MapPin,
  ChevronRight,
  Compass,
  ListFilter,
  BarChart2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MetaverseMapProps {
  player: PlayerStats;
  onOpenQuiz: (verse: BibleVerse) => void;
  onOpenDashboard: () => void;
  onOpenAIHelp: () => void;
  onOpenItemInventory: () => void;
}

interface MapEntity {
  id: string;
  x: number;
  y: number;
  type: 'verse_gate' | 'fruit' | 'classmate' | 'finish_stage' | 'obstacle';
  verse?: BibleVerse;
  fruitType?: 'lemon' | 'orange' | 'apple';
  collected?: boolean;
  classmateName?: string;
  preset?: any;
  label?: string;
}

export const MetaverseMap: React.FC<MetaverseMapProps> = ({
  player,
  onOpenQuiz,
  onOpenDashboard,
  onOpenAIHelp,
  onOpenItemInventory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Player Position & Direction
  const [playerPos, setPlayerPos] = useState({ x: 200, y: 350 });
  const [direction, setDirection] = useState<'down' | 'left' | 'right' | 'up'>('down');
  const [walkFrame, setWalkFrame] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Interactive Target
  const [activeGate, setActiveGate] = useState<BibleVerse | null>(null);
  const [collectedFruits, setCollectedFruits] = useState<number>(0);

  // Map dimensions
  const MAP_WIDTH = 2200;
  const MAP_HEIGHT = 800;

  // Key tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Generate map stations and entities
  const [entities, setEntities] = useState<MapEntity[]>(() => {
    const list: MapEntity[] = [];

    // Place 36 Bible Verse Gates across 5 stages along the map path X: 150 -> 2050
    // Requirement: Randomize verses order instead of date order!
    const randomizedVerses = [...BIBLE_VERSES].sort(() => Math.random() - 0.5);

    randomizedVerses.forEach((verse, idx) => {
      const stationNum = idx + 1;
      const stageIdx = Math.min(4, Math.floor(idx / 7));
      const stageStartX = 150 + stageIdx * 380;
      const x = stageStartX + (idx % 7) * 50 + (Math.random() * 20 - 10);
      const y = 200 + ((idx * 83) % 360);

      list.push({
        id: `gate_${verse.id}_${stationNum}`,
        x,
        y,
        type: 'verse_gate',
        verse,
        label: `미션 #${stationNum}`,
      });
    });

    // Fruits / Collectibles
    for (let i = 0; i < 25; i++) {
      const fType = i % 3 === 0 ? 'lemon' : i % 3 === 1 ? 'orange' : 'apple';
      list.push({
        id: `fruit_${i}`,
        x: 100 + i * 80 + Math.random() * 30,
        y: 180 + (i * 47) % 380,
        type: 'fruit',
        fruitType: fType,
        collected: false,
      });
    }

    // Simulated Classmates
    const classmateNames = ['박주은 (4학년)', '이하준 (5학년)', '김다은 (6학년)', '최서준 (5학년)', '한예원 (4학년)'];
    classmateNames.forEach((name, idx) => {
      list.push({
        id: `classmate_${idx}`,
        x: 300 + idx * 350 + Math.random() * 50,
        y: 280 + (idx % 2) * 120,
        type: 'classmate',
        classmateName: name,
        preset: CHARACTER_PRESETS[(idx + 1) % CHARACTER_PRESETS.length],
      });
    });

    // Finish Stage Monument at X: 2000
    list.push({
      id: 'finish_monument',
      x: 2020,
      y: 350,
      type: 'finish_stage',
      label: '🏆 약속의 땅 가나안 피니시 스테이지',
    });

    return list;
  });

  // Calculate speed multiplier based on items
  const speedBonus = player.equippedItems.includes('shoes_peace')
    ? 1.35
    : player.equippedItems.includes('belt_truth')
    ? 1.15
    : 1.0;
  const moveSpeed = 4.5 * speedBonus;

  // Handle Keyboard Movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation & Position Update Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a'] || keysPressed.current['A']) {
        dx -= 1;
        setDirection('left');
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d'] || keysPressed.current['D']) {
        dx += 1;
        setDirection('right');
      }
      if (keysPressed.current['ArrowUp'] || keysPressed.current['w'] || keysPressed.current['W']) {
        dy -= 1;
        setDirection('up');
      }
      if (keysPressed.current['ArrowDown'] || keysPressed.current['s'] || keysPressed.current['S']) {
        dy += 1;
        setDirection('down');
      }

      if (dx !== 0 || dy !== 0) {
        setIsMoving(true);
        setWalkFrame((prev) => (prev + 0.2) % 4);

        setPlayerPos((prev) => {
          const newX = Math.max(50, Math.min(MAP_WIDTH - 80, prev.x + dx * moveSpeed));
          const newY = Math.max(120, Math.min(MAP_HEIGHT - 120, prev.y + dy * moveSpeed));
          return { x: newX, y: newY };
        });
      } else {
        setIsMoving(false);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [moveSpeed]);

  // Check Proximity to Gates & Fruit Collectibles
  useEffect(() => {
    let nearestGate: BibleVerse | null = null;
    let minDist = 60;

    entities.forEach((entity) => {
      const dist = Math.hypot(playerPos.x - entity.x, playerPos.y - entity.y);

      // Verse Gate proximity
      if (entity.type === 'verse_gate' && entity.verse && dist < minDist) {
        nearestGate = entity.verse;
      }

      // Fruit collection proximity
      if (entity.type === 'fruit' && !entity.collected && dist < 35) {
        setEntities((prev) =>
          prev.map((e) => (e.id === entity.id ? { ...e, collected: true } : e))
        );
        setCollectedFruits((prev) => prev + 1);
      }
    });

    setActiveGate(nearestGate);
  }, [playerPos, entities]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Camera view centered on Player
    const cameraX = Math.max(0, Math.min(MAP_WIDTH - canvas.width, playerPos.x - canvas.width / 2));
    const cameraY = Math.max(0, Math.min(MAP_HEIGHT - canvas.height, playerPos.y - canvas.height / 2));

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // 1. Draw Map Background Zones (Beach, Grass, River, Jericho, Promised Land)
    // Zone 1: Eden Grass (0 -> 450)
    ctx.fillStyle = '#86EFAC';
    ctx.fillRect(0, 0, 450, MAP_HEIGHT);

    // Zone 2: Beach Sand (450 -> 900) - Reference image style
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(450, 0, 450, MAP_HEIGHT);

    // Ocean Coast at top of beach (Y: 0 -> 120)
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(450, 0, 450, 120);
    // Ocean Waves
    ctx.fillStyle = '#E0F2FE';
    for (let w = 450; w < 900; w += 40) {
      ctx.beginPath();
      ctx.arc(w + 20, 115, 12, 0, Math.PI);
      ctx.fill();
    }

    // Pier / Boardwalk on Beach
    ctx.fillStyle = '#92400E';
    ctx.fillRect(620, 60, 100, 140);
    ctx.fillStyle = '#B45309';
    for (let py = 65; py < 190; py += 12) {
      ctx.fillRect(622, py, 96, 2);
    }

    // Zone 3: River Jordan (900 -> 1350)
    ctx.fillStyle = '#BBF7D0';
    ctx.fillRect(900, 0, 450, MAP_HEIGHT);
    // River Stream through middle
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(900, 200, 450, 160);
    // Stepping Stones
    ctx.fillStyle = '#94A3B8';
    for (let stoneX = 940; stoneX < 1320; stoneX += 80) {
      ctx.beginPath();
      ctx.arc(stoneX, 280 + (stoneX % 30), 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Zone 4: Jericho Fortress Path (1350 -> 1800)
    ctx.fillStyle = '#FED7AA';
    ctx.fillRect(1350, 0, 450, MAP_HEIGHT);
    // Jericho Stone Walls
    ctx.fillStyle = '#78350F';
    ctx.fillRect(1450, 100, 20, 300);
    ctx.fillRect(1650, 100, 20, 300);

    // Zone 5: Promised Land Canaan Oasis (1800 -> 2200)
    const goldGrad = ctx.createLinearGradient(1800, 0, 2200, MAP_HEIGHT);
    goldGrad.addColorStop(0, '#FEF08A');
    goldGrad.addColorStop(1, '#FDE047');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(1800, 0, 400, MAP_HEIGHT);

    // Decorative Trees, Palms & Rocks
    // Palm trees in beach zone
    const drawPalmTree = (tx: number, ty: number) => {
      ctx.fillStyle = '#B45309';
      ctx.fillRect(tx - 4, ty, 8, 30); // Trunk
      ctx.fillStyle = '#15803D';
      ctx.beginPath(); ctx.arc(tx - 12, ty - 6, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + 12, ty - 6, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx, ty - 16, 16, 0, Math.PI * 2); ctx.fill();
    };

    drawPalmTree(500, 220);
    drawPalmTree(580, 480);
    drawPalmTree(820, 250);
    drawPalmTree(860, 520);
    drawPalmTree(1850, 180);
    drawPalmTree(1920, 500);

    // Stage Boundary Markers / Flags
    STAGES_INFO.forEach((stage, idx) => {
      const sx = 150 + idx * 380;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(sx - 40, 120, 140, 30);
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(stage.badge, sx - 32, 140);
    });

    // 2. Draw Entities (Gates, Fruits, Classmates, Finish Stage)
    entities.forEach((entity) => {
      if (entity.type === 'verse_gate' && entity.verse) {
        const isCompleted = player.completedVerseIds.includes(entity.verse.id);

        // Verse Station Platform
        ctx.fillStyle = isCompleted ? '#22C55E' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon inside station
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isCompleted ? '✓' : `${entity.label ? entity.label.replace('미션 #', '') : entity.verse.id}`, entity.x, entity.y + 4);

        // Simple Mission Label above gate (NO Scripture Reference Address)
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(entity.x - 35, entity.y - 38, 70, 18);
        ctx.fillStyle = isCompleted ? '#86EFAC' : '#FEF08A';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(entity.label || `미션 #${entity.verse.id}`, entity.x, entity.y - 25);
      } else if (entity.type === 'fruit' && !entity.collected) {
        // Draw fruit collectible
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        const fruitEmoji = entity.fruitType === 'lemon' ? '🍋' : entity.fruitType === 'orange' ? '🍊' : '🍎';
        ctx.fillText(fruitEmoji, entity.x, entity.y);
      } else if (entity.type === 'classmate') {
        // Draw simulated online classmate
        drawPixelSprite(
          ctx,
          entity.preset,
          entity.x - 16,
          entity.y - 16,
          32,
          'down',
          0,
          false
        );
        // Name tag
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.fillRect(entity.x - 35, entity.y - 32, 70, 14);
        ctx.fillStyle = '#6EE7B7';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(entity.classmateName || '', entity.x, entity.y - 22);
      } else if (entity.type === 'finish_stage') {
        // Draw Finish Ship / Wooden Stage Arch (Reference screenshot style)
        ctx.fillStyle = '#78350F';
        ctx.fillRect(entity.x - 80, entity.y - 60, 160, 100);
        ctx.fillStyle = '#B45309';
        ctx.fillRect(entity.x - 70, entity.y - 50, 140, 80);

        // FINISH Banner
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(entity.x - 50, entity.y - 85, 100, 26);
        ctx.fillStyle = '#DC2626';
        ctx.font = 'black 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH! 🏆', entity.x, entity.y - 68);
      }
    });

    // 3. Draw Main Player Avatar
    const hasAura = player.equippedItems.includes('helmet_salvation');
    drawPixelSprite(
      ctx,
      player.character,
      playerPos.x - 20,
      playerPos.y - 20,
      40,
      direction,
      Math.floor(walkFrame),
      hasAura
    );

    // Player Name Tag & Title
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(playerPos.x - 45, playerPos.y - 38, 90, 16);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.name} (${player.grade})`, playerPos.x, playerPos.y - 26);

    ctx.restore();
  }, [playerPos, direction, walkFrame, entities, player]);

  // Touch/Click to move handler for mobile
  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cameraX = Math.max(0, Math.min(MAP_WIDTH - canvas.width, playerPos.x - canvas.width / 2));
    const cameraY = Math.max(0, Math.min(MAP_HEIGHT - canvas.height, playerPos.y - canvas.height / 2));

    const clickX = e.clientX - rect.left + cameraX;
    const clickY = e.clientY - rect.top + cameraY;

    setPlayerPos({ x: clickX, y: clickY });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between select-none">
      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Player Profile & Score Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-amber-500/40 p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto">
          <SpriteCanvas preset={player.character} size={36} animated={false} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-300 text-sm">{player.name}</span>
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                {player.grade}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <BookOpen className="w-3.5 h-3.5" /> 암송: {player.completedVerseIds.length}/36
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Trophy className="w-3.5 h-3.5" /> 점수: {player.score}점
              </span>
              <span className="text-amber-300">🍋 x{collectedFruits}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenItemInventory}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>보물/장비 ({player.equippedItems.length})</span>
          </button>

          <button
            onClick={onOpenAIHelp}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 말씀 튜터</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            <span>대시보드 / 순위</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-full flex-1">
        <canvas
          ref={canvasRef}
          width={window.innerWidth || 1280}
          height={window.innerHeight || 720}
          onClick={handleMapClick}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Interactive Prompt Banner when near a verse gate */}
        {activeGate && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
            <button
              onClick={() => onOpenQuiz(activeGate!)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white text-base cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              <span>
                [미션 #{activeGate.id}] 성경 암송 도전하기! (클릭 / 터치)
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Mini Map & Controls Info */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Controls Info */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-xl pointer-events-auto flex items-center gap-3">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>키보드 방향키/WASD 또는 맵 클릭으로 이동하세요!</span>
        </div>

        {/* Stage Progress Bar */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 px-4 rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto flex items-center gap-4">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>약속의 땅 진행도</span>
          </div>
          <div className="w-36 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${Math.round((player.completedVerseIds.length / 36) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-extrabold text-amber-400">
            {Math.round((player.completedVerseIds.length / 36) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
