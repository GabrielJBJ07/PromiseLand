import React, { useEffect, useRef, useState } from 'react';
import { PlayerStats, BibleVerse } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { drawPixelSprite } from '../utils/spriteGenerator';
import { SpriteCanvas } from './SpriteCanvas';
import { CHARACTER_PRESETS } from '../utils/spriteGenerator';
import promisedLandMapImg from '../assets/images/promised_land_map_1785069145605.jpg';
import {
  BookOpen,
  Trophy,
  Sparkles,
  MapPin,
  ChevronRight,
  Compass,
  BarChart2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Flame,
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
  type: 'verse_gate' | 'fruit' | 'classmate' | 'finish_stage';
  verse?: BibleVerse;
  fruitType?: 'lemon' | 'orange' | 'apple';
  collected?: boolean;
  classmateName?: string;
  preset?: any;
  label?: string;
  stationNumber?: number;
  zoneName?: string;
}

interface LandmarkBanner {
  name: string;
  sub: string;
  icon: string;
  x: number;
  y: number;
}

export const MetaverseMap: React.FC<MetaverseMapProps> = ({
  player,
  onOpenQuiz,
  onOpenDashboard,
  onOpenAIHelp,
  onOpenItemInventory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Player Position & Direction
  const [playerPos, setPlayerPos] = useState({ x: 140, y: 680 });
  const [direction, setDirection] = useState<'down' | 'left' | 'right' | 'up'>('down');
  const [walkFrame, setWalkFrame] = useState(0);
  const [collectedFruits, setCollectedFruits] = useState<number>(0);

  // Interactive Target
  const [activeGate, setActiveGate] = useState<BibleVerse | null>(null);

  // Screen Dimensions for Mobile / Tablet
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  // Map dimensions
  const MAP_WIDTH = 2200;
  const MAP_HEIGHT = 800;

  // Key & Virtual Touch Controls Tracking
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const touchDirections = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Handle Resize for Mobile/Tablet Screens
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Preload Map Image
  useEffect(() => {
    const img = new Image();
    img.src = promisedLandMapImg;
    img.onload = () => {
      mapImageRef.current = img;
      setMapLoaded(true);
    };
  }, []);

  // Defined Landmarks matching the '약속의 땅.png' picture
  const LANDMARKS: LandmarkBanner[] = [
    { name: '출발 (Start)', sub: 'Wilderness', icon: '⛺', x: 120, y: 720 },
    { name: '광야', sub: 'Wilderness', icon: '🏜️', x: 300, y: 620 },
    { name: '홍해', sub: 'Red Sea', icon: '🌊', x: 580, y: 480 },
    { name: '오아시스', sub: 'Oasis', icon: '🌴', x: 820, y: 220 },
    { name: '성막', sub: 'Tabernacle', icon: '🎪', x: 1100, y: 360 },
    { name: '시내산', sub: 'Mount Sinai', icon: '📜', x: 1300, y: 700 },
    { name: '요단강', sub: 'Jordan River', icon: '🏞️', x: 1500, y: 230 },
    { name: '여리고성', sub: 'Jericho', icon: '🏰', x: 1720, y: 360 },
    { name: '약속의 땅 예루살렘', sub: 'Promised Land', icon: '🏛️', x: 1920, y: 180 },
    { name: '도착', sub: 'Arrival', icon: '🚩', x: 2080, y: 550 },
  ];

  // Generate 36 Mission Activity Pointers along the map journey path
  const [entities, setEntities] = useState<MapEntity[]>(() => {
    const list: MapEntity[] = [];

    // Path coordinates mapping 36 stations from Start to Finish across landmark zones
    const pathWaypoints: { x: number; y: number; zone: string }[] = [
      // Zone 1: 광야 (Wilderness) - 1..4
      { x: 160, y: 660, zone: '출발' },
      { x: 260, y: 630, zone: '광야' },
      { x: 360, y: 580, zone: '광야' },
      { x: 460, y: 520, zone: '광야' },

      // Zone 2: 홍해 (Red Sea) - 5..8
      { x: 540, y: 470, zone: '홍해' },
      { x: 620, y: 410, zone: '홍해' },
      { x: 700, y: 350, zone: '홍해' },
      { x: 780, y: 290, zone: '홍해' },

      // Zone 3: 오아시스 (Oasis) - 9..12
      { x: 860, y: 260, zone: '오아시스' },
      { x: 940, y: 300, zone: '오아시스' },
      { x: 1010, y: 350, zone: '오아시스' },
      { x: 1080, y: 400, zone: '성막' },

      // Zone 4: 성막 (Tabernacle) - 13..16
      { x: 1150, y: 440, zone: '성막' },
      { x: 1200, y: 520, zone: '성막' },
      { x: 1240, y: 600, zone: '시내산' },
      { x: 1290, y: 660, zone: '시내산' },

      // Zone 5: 시내산 (Mount Sinai) - 17..20
      { x: 1340, y: 680, zone: '시내산' },
      { x: 1390, y: 610, zone: '시내산' },
      { x: 1430, y: 510, zone: '요단강' },
      { x: 1470, y: 410, zone: '요단강' },

      // Zone 6: 요단강 (Jordan River) - 21..24
      { x: 1510, y: 310, zone: '요단강' },
      { x: 1560, y: 250, zone: '요단강' },
      { x: 1620, y: 290, zone: '여리고성' },
      { x: 1680, y: 340, zone: '여리고성' },

      // Zone 7: 여리고성 (Jericho) - 25..28
      { x: 1730, y: 390, zone: '여리고성' },
      { x: 1780, y: 330, zone: '여리고성' },
      { x: 1830, y: 260, zone: '약속의 땅' },
      { x: 1880, y: 210, zone: '약속의 땅' },

      // Zone 8: 약속의 땅 (Promised Land / Jerusalem) - 29..32
      { x: 1930, y: 170, zone: '예루살렘' },
      { x: 1980, y: 220, zone: '예루살렘' },
      { x: 2010, y: 300, zone: '약속의 땅' },
      { x: 2040, y: 390, zone: '도착' },

      // Zone 9: 도착 (Finish) - 33..36
      { x: 2060, y: 470, zone: '도착' },
      { x: 2080, y: 530, zone: '도착' },
      { x: 2100, y: 590, zone: '도착' },
      { x: 2120, y: 650, zone: '완성 피니시' },
    ];

    // Assign 36 Bible Verses to path pointers
    BIBLE_VERSES.forEach((verse, idx) => {
      const stationNumber = idx + 1;
      const point = pathWaypoints[idx] || { x: 200 + idx * 50, y: 400, zone: '여정' };

      list.push({
        id: `gate_${verse.id}_${stationNumber}`,
        x: point.x,
        y: point.y,
        type: 'verse_gate',
        verse,
        stationNumber,
        label: `미션 #${stationNumber}`,
        zoneName: point.zone,
      });
    });

    // Fruits / Collectibles along path
    for (let i = 0; i < 20; i++) {
      const fType = i % 3 === 0 ? 'lemon' : i % 3 === 1 ? 'orange' : 'apple';
      const waypoint = pathWaypoints[(i * 2) % 36];
      list.push({
        id: `fruit_${i}`,
        x: waypoint.x + (Math.sin(i) * 35),
        y: waypoint.y + (Math.cos(i) * 35),
        type: 'fruit',
        fruitType: fType,
        collected: false,
      });
    }

    // Simulated Classmates placed near landmark zones
    const classmateNames = ['박주은 (4학년)', '이하준 (5학년)', '김다은 (6학년)', '최서준 (5학년)', '한예원 (4학년)'];
    const classmateWaypoints = [pathWaypoints[2], pathWaypoints[8], pathWaypoints[16], pathWaypoints[24], pathWaypoints[30]];
    classmateNames.forEach((name, idx) => {
      const wp = classmateWaypoints[idx] || pathWaypoints[idx * 6];
      list.push({
        id: `classmate_${idx}`,
        x: wp.x + 25,
        y: wp.y - 25,
        type: 'classmate',
        classmateName: name,
        preset: CHARACTER_PRESETS[(idx + 1) % CHARACTER_PRESETS.length],
      });
    });

    // Finish Stage Monument at X: 2120
    list.push({
      id: 'finish_monument',
      x: 2120,
      y: 650,
      type: 'finish_stage',
      label: '🏆 약속의 땅 완송 피니시',
    });

    return list;
  });

  // Calculate speed multiplier based on items
  const speedBonus = player.equippedItems.includes('shoes_peace')
    ? 1.35
    : player.equippedItems.includes('belt_truth')
    ? 1.15
    : 1.0;
  const moveSpeed = 5.5 * speedBonus;

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

  // Animation & Movement Loop (supports keyboard + mobile touch controls)
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      // Keyboard or Virtual Touch D-Pad Input
      if (
        keysPressed.current['ArrowLeft'] ||
        keysPressed.current['a'] ||
        keysPressed.current['A'] ||
        touchDirections.current.left
      ) {
        dx -= 1;
        setDirection('left');
      }
      if (
        keysPressed.current['ArrowRight'] ||
        keysPressed.current['d'] ||
        keysPressed.current['D'] ||
        touchDirections.current.right
      ) {
        dx += 1;
        setDirection('right');
      }
      if (
        keysPressed.current['ArrowUp'] ||
        keysPressed.current['w'] ||
        keysPressed.current['W'] ||
        touchDirections.current.up
      ) {
        dy -= 1;
        setDirection('up');
      }
      if (
        keysPressed.current['ArrowDown'] ||
        keysPressed.current['s'] ||
        keysPressed.current['S'] ||
        touchDirections.current.down
      ) {
        dy += 1;
        setDirection('down');
      }

      if (dx !== 0 || dy !== 0) {
        setWalkFrame((prev) => (prev + 0.25) % 4);

        setPlayerPos((prev) => {
          const newX = Math.max(50, Math.min(MAP_WIDTH - 50, prev.x + dx * moveSpeed));
          const newY = Math.max(80, Math.min(MAP_HEIGHT - 80, prev.y + dy * moveSpeed));
          return { x: newX, y: newY };
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [moveSpeed]);

  // Check Proximity to Gates & Fruit Collectibles
  useEffect(() => {
    let nearestGate: BibleVerse | null = null;
    let minDist = 75;

    entities.forEach((entity) => {
      const dist = Math.hypot(playerPos.x - entity.x, playerPos.y - entity.y);

      // Verse Gate proximity
      if (entity.type === 'verse_gate' && entity.verse && dist < minDist) {
        nearestGate = entity.verse;
      }

      // Fruit collection proximity
      if (entity.type === 'fruit' && !entity.collected && dist < 38) {
        setEntities((prev) =>
          prev.map((e) => (e.id === entity.id ? { ...e, collected: true } : e))
        );
        setCollectedFruits((prev) => prev + 1);
      }
    });

    setActiveGate(nearestGate);
  }, [playerPos, entities]);

  // Canvas Render Loop with High-DPI Pixel Ratio for Mobile Phone / Tablet Sharpness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = screenSize.width;
    const height = screenSize.height;

    // Set canvas buffer resolution according to devicePixelRatio
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Scale canvas context for sharp rendering on Mobile Retina / AMOLED screens
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, width, height);

    // Camera view centered on Player
    const cameraX = Math.max(0, Math.min(MAP_WIDTH - width, playerPos.x - width / 2));
    const cameraY = Math.max(0, Math.min(MAP_HEIGHT - height, playerPos.y - height / 2));

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // 1. Draw Map Image '약속의 땅.png' as full background
    if (mapImageRef.current && mapLoaded) {
      ctx.drawImage(mapImageRef.current, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }

    // 2. Draw Connected Winding Mission Path Line
    const gateEntities = entities.filter((e) => e.type === 'verse_gate');
    if (gateEntities.length > 1) {
      // Outer Glow Line
      ctx.beginPath();
      ctx.setLineDash([10, 6]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      gateEntities.forEach((g, idx) => {
        if (idx === 0) ctx.moveTo(g.x, g.y);
        else ctx.lineTo(g.x, g.y);
      });
      ctx.stroke();

      // Inner Bright Line
      ctx.beginPath();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#FDE047';
      gateEntities.forEach((g, idx) => {
        if (idx === 0) ctx.moveTo(g.x, g.y);
        else ctx.lineTo(g.x, g.y);
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash
    }

    // 3. Draw Landmark Labels on the Map
    LANDMARKS.forEach((lm) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(lm.x - 55, lm.y - 28, 110, 32, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${lm.icon} ${lm.name}`, lm.x, lm.y - 12);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px sans-serif';
      ctx.fillText(lm.sub, lm.x, lm.y + 1);
    });

    // 4. Draw Mission Activity Pointers
    gateEntities.forEach((entity) => {
      if (!entity.verse) return;
      const isCompleted = player.completedVerseIds.includes(entity.verse.id);
      const isNextAvailable =
        !isCompleted &&
        (entity.stationNumber === 1 || player.completedVerseIds.includes(entity.verse.id - 1));

      // Pointer Outer Pulsing Aura for active/next available mission
      if (isNextAvailable) {
        const pulseSize = 28 + Math.sin(Date.now() / 200) * 4;
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pointer Node Circle
      ctx.fillStyle = isCompleted ? '#16A34A' : isNextAvailable ? '#EAB308' : '#334155';
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, 18, 0, Math.PI * 2);
      ctx.fill();

      // Border Ring
      ctx.strokeStyle = isCompleted ? '#86EFAC' : isNextAvailable ? '#FFFFFF' : '#64748B';
      ctx.lineWidth = isNextAvailable ? 3 : 2;
      ctx.stroke();

      // Icon inside pointer
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isCompleted ? '✓' : `${entity.stationNumber}`, entity.x, entity.y + 4);

      // Station Badge Tag above pointer
      const badgeText = `미션 #${entity.stationNumber}`;
      ctx.fillStyle = isCompleted
        ? 'rgba(22, 101, 52, 0.95)'
        : isNextAvailable
        ? 'rgba(161, 98, 7, 0.95)'
        : 'rgba(15, 23, 42, 0.88)';

      ctx.beginPath();
      ctx.roundRect(entity.x - 30, entity.y - 36, 60, 16, 6);
      ctx.fill();

      ctx.fillStyle = isCompleted ? '#86EFAC' : isNextAvailable ? '#FEF08A' : '#94A3B8';
      ctx.font = 'extrabold 9px sans-serif';
      ctx.fillText(badgeText, entity.x, entity.y - 24);
    });

    // 5. Draw Collectible Fruits & Classmates
    entities.forEach((entity) => {
      if (entity.type === 'fruit' && !entity.collected) {
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        const fruitEmoji = entity.fruitType === 'lemon' ? '🍋' : entity.fruitType === 'orange' ? '🍊' : '🍎';
        ctx.fillText(fruitEmoji, entity.x, entity.y);
      } else if (entity.type === 'classmate') {
        drawPixelSprite(
          ctx,
          entity.preset,
          entity.x - 14,
          entity.y - 14,
          28,
          'down',
          0,
          false
        );
        ctx.fillStyle = 'rgba(15,23,42,0.85)';
        ctx.fillRect(entity.x - 35, entity.y - 28, 70, 12);
        ctx.fillStyle = '#6EE7B7';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(entity.classmateName || '', entity.x, entity.y - 19);
      } else if (entity.type === 'finish_stage') {
        // Finish Flag
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(entity.x - 50, entity.y - 30, 100, 26, 8);
        ctx.fill();
        ctx.strokeStyle = '#EAB308';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FDE047';
        ctx.font = 'black 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH! 🏁', entity.x, entity.y - 13);
      }
    });

    // 6. Draw Player Character Avatar
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

    // Player Name Tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(playerPos.x - 45, playerPos.y - 40, 90, 16, 6);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.name} (${player.grade})`, playerPos.x, playerPos.y - 28);

    ctx.restore();
  }, [playerPos, direction, walkFrame, entities, player, mapLoaded, screenSize]);

  // Handle Touch/Click on Canvas to move player or trigger mission pointer directly
  const handleMapTouchOrClick = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cameraX = Math.max(0, Math.min(MAP_WIDTH - screenSize.width, playerPos.x - screenSize.width / 2));
    const cameraY = Math.max(0, Math.min(MAP_HEIGHT - screenSize.height, playerPos.y - screenSize.height / 2));

    const clickX = clientX - rect.left + cameraX;
    const clickY = clientY - rect.top + cameraY;

    // Check if clicked directly on or near a mission pointer
    const clickedGate = entities.find((entity) => {
      if (entity.type !== 'verse_gate') return false;
      const dist = Math.hypot(clickX - entity.x, clickY - entity.y);
      return dist < 36;
    });

    if (clickedGate && clickedGate.verse) {
      setPlayerPos({ x: clickedGate.x, y: clickedGate.y });
      onOpenQuiz(clickedGate.verse);
    } else {
      setPlayerPos({ x: clickX, y: clickY });
    }
  };

  // Virtual Touch Controller Event Helpers
  const handleTouchDirStart = (dir: 'up' | 'down' | 'left' | 'right') => {
    touchDirections.current[dir] = true;
  };
  const handleTouchDirEnd = (dir: 'up' | 'down' | 'left' | 'right') => {
    touchDirections.current[dir] = false;
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between select-none touch-none">
      {/* Responsive Mobile/Tablet Top HUD Bar */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Player Profile & Score Badge */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-amber-500/40 p-2 px-3 sm:p-2.5 sm:px-4 rounded-2xl shadow-xl backdrop-blur-md pointer-events-auto shrink-0">
          <SpriteCanvas preset={player.character} size={32} animated={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-amber-300 text-xs sm:text-sm">{player.name}</span>
              <span className="bg-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/30">
                {player.grade}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-300 mt-0.5">
              <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {player.completedVerseIds.length}/36
              </span>
              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {player.score}점
              </span>
              <span className="text-amber-300">🍋 x{collectedFruits}</span>
            </div>
          </div>
        </div>

        {/* Action Controls for Mobile Phone & Tablet */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto flex-wrap">
          <button
            onClick={onOpenItemInventory}
            className="flex items-center gap-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs transition shadow-lg cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">보물/장비</span>
            <span className="sm:hidden">장비</span> ({player.equippedItems.length})
          </button>

          <button
            onClick={onOpenAIHelp}
            className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs transition shadow-lg cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 튜터</span>
          </button>

          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs transition shadow-lg cursor-pointer active:scale-95"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>대시보드</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-full flex-1">
        <canvas
          ref={canvasRef}
          onClick={(e) => handleMapTouchOrClick(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              handleMapTouchOrClick(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          className="w-full h-full cursor-crosshair block touch-none"
        />

        {/* Interactive Prompt Banner when near a verse gate */}
        {activeGate && (
          <div className="absolute bottom-24 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-30 animate-bounce max-w-[90vw]">
            <button
              onClick={() => onOpenQuiz(activeGate!)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 border-2 border-white text-xs sm:text-base cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="truncate">
                [{activeGate.reference}] 미션 도전! (터치)
              </span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
          </div>
        )}
      </div>

      {/* MOBILE TOUCH CONTROLS (Virtual D-Pad on Mobile & Tablet PCs) */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center pointer-events-auto">
        {/* Touch Cross D-Pad */}
        <div className="relative w-32 h-32 bg-slate-900/80 border-2 border-amber-500/40 rounded-full p-2 backdrop-blur-md shadow-2xl flex items-center justify-center">
          <button
            onMouseDown={() => handleTouchDirStart('up')}
            onMouseUp={() => handleTouchDirEnd('up')}
            onTouchStart={() => handleTouchDirStart('up')}
            onTouchEnd={() => handleTouchDirEnd('up')}
            className="absolute top-1 w-10 h-10 bg-slate-800 active:bg-amber-500 text-slate-200 active:text-slate-950 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition"
            aria-label="Move Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>

          <button
            onMouseDown={() => handleTouchDirStart('down')}
            onMouseUp={() => handleTouchDirEnd('down')}
            onTouchStart={() => handleTouchDirStart('down')}
            onTouchEnd={() => handleTouchDirEnd('down')}
            className="absolute bottom-1 w-10 h-10 bg-slate-800 active:bg-amber-500 text-slate-200 active:text-slate-950 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition"
            aria-label="Move Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onMouseDown={() => handleTouchDirStart('left')}
            onMouseUp={() => handleTouchDirEnd('left')}
            onTouchStart={() => handleTouchDirStart('left')}
            onTouchEnd={() => handleTouchDirEnd('left')}
            className="absolute left-1 w-10 h-10 bg-slate-800 active:bg-amber-500 text-slate-200 active:text-slate-950 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onMouseDown={() => handleTouchDirStart('right')}
            onMouseUp={() => handleTouchDirEnd('right')}
            onTouchStart={() => handleTouchDirStart('right')}
            onTouchEnd={() => handleTouchDirEnd('right')}
            className="absolute right-1 w-10 h-10 bg-slate-800 active:bg-amber-500 text-slate-200 active:text-slate-950 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition"
            aria-label="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Center Touch Indicator */}
          <div className="w-5 h-5 bg-amber-500/50 rounded-full border border-amber-400/80" />
        </div>
      </div>

      {/* Bottom Right Mobile Journey Progress Badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <div className="bg-slate-900/90 border border-amber-500/30 p-2 px-3 sm:p-2.5 sm:px-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 sm:gap-3">
          <div className="text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span className="hidden sm:inline">여정 달성률</span>
          </div>
          <div className="w-20 sm:w-32 bg-slate-950 h-2.5 sm:h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${Math.round((player.completedVerseIds.length / 36) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] sm:text-xs font-extrabold text-amber-400">
            {Math.round((player.completedVerseIds.length / 36) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
