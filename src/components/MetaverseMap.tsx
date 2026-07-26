import React, { useEffect, useRef, useState } from 'react';
import { PlayerStats, BibleVerse, LeaderboardEntry } from '../types';
import { BIBLE_VERSES } from '../data/bibleVerses';
import { drawPixelSprite } from '../utils/spriteGenerator';
import { SpriteCanvas } from './SpriteCanvas';
import promisedLandMapImg from '../assets/images/promised_land_map_1785069145605.jpg';
import { bgmSynth } from '../utils/bgmSynth';
import {
  BookOpen,
  Trophy,
  Sparkles,
  Play,
  Square,
  QrCode,
  Users,
  Compass,
  BarChart2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  Award,
  Music,
  Volume2,
  VolumeX,
  Heart,
  Star,
  Zap,
} from 'lucide-react';

interface MetaverseMapProps {
  player: PlayerStats;
  joinedStudents: LeaderboardEntry[];
  gameSessionStatus: 'WAITING' | 'PLAYING' | 'ENDED';
  onStartGameSession: () => void;
  onEndGameSession: () => void;
  onOpenAwardCeremony: () => void;
  onOpenQRModal: () => void;
  onOpenQuiz: (verse: BibleVerse) => void;
  onOpenDashboard: () => void;
  onOpenAIHelp: () => void;
  onOpenItemInventory: () => void;
}

interface MapEntity {
  id: string;
  x: number;
  y: number;
  type: 'verse_gate' | 'fruit' | 'finish_stage';
  verse?: BibleVerse;
  fruitType?: 'lemon' | 'orange' | 'apple';
  collected?: boolean;
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
  joinedStudents,
  gameSessionStatus,
  onStartGameSession,
  onEndGameSession,
  onOpenAwardCeremony,
  onOpenQRModal,
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

  // Path Waypoints coordinates for the 36 stations from Start to Finish
  const pathWaypoints: { x: number; y: number; zone: string }[] = [
    { x: 160, y: 660, zone: '출발' },
    { x: 260, y: 630, zone: '광야' },
    { x: 360, y: 580, zone: '광야' },
    { x: 460, y: 520, zone: '광야' },
    { x: 540, y: 470, zone: '홍해' },
    { x: 620, y: 410, zone: '홍해' },
    { x: 700, y: 350, zone: '홍해' },
    { x: 780, y: 290, zone: '홍해' },
    { x: 860, y: 260, zone: '오아시스' },
    { x: 940, y: 300, zone: '오아시스' },
    { x: 1010, y: 350, zone: '오아시스' },
    { x: 1080, y: 400, zone: '성막' },
    { x: 1150, y: 440, zone: '성막' },
    { x: 1200, y: 520, zone: '성막' },
    { x: 1240, y: 600, zone: '시내산' },
    { x: 1290, y: 660, zone: '시내산' },
    { x: 1340, y: 680, zone: '시내산' },
    { x: 1390, y: 610, zone: '시내산' },
    { x: 1430, y: 510, zone: '요단강' },
    { x: 1470, y: 410, zone: '요단강' },
    { x: 1510, y: 310, zone: '요단강' },
    { x: 1560, y: 250, zone: '요단강' },
    { x: 1620, y: 290, zone: '여리고성' },
    { x: 1680, y: 340, zone: '여리고성' },
    { x: 1730, y: 390, zone: '여리고성' },
    { x: 1780, y: 330, zone: '여리고성' },
    { x: 1830, y: 260, zone: '약속의 땅' },
    { x: 1880, y: 210, zone: '약속의 땅' },
    { x: 1930, y: 170, zone: '예루살렘' },
    { x: 1980, y: 220, zone: '예루살렘' },
    { x: 2010, y: 300, zone: '약속의 땅' },
    { x: 2040, y: 390, zone: '도착' },
    { x: 2060, y: 470, zone: '도착' },
    { x: 2080, y: 530, zone: '도착' },
    { x: 2100, y: 590, zone: '도착' },
    { x: 2120, y: 650, zone: '완성 피니시' },
  ];

  // Generate 36 Mission Activity Pointers along the map journey path
  const [entities, setEntities] = useState<MapEntity[]>(() => {
    const list: MapEntity[] = [];

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
        x: waypoint.x + Math.sin(i) * 35,
        y: waypoint.y + Math.cos(i) * 35,
        type: 'fruit',
        fruitType: fType,
        collected: false,
      });
    }

    // Finish Stage Monument
    list.push({
      id: 'finish_monument',
      x: 2120,
      y: 650,
      type: 'finish_stage',
      label: '🏆 약속의 땅 완송 피니시',
    });

    return list;
  });

  // Canvas Touch / Mouse Drag Movement Handler
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  useEffect(() => {
    const unsub = bgmSynth.subscribe((playing) => {
      setIsBgmPlaying(playing);
    });
    return unsub;
  }, []);

  const handleToggleBgm = () => {
    bgmSynth.toggleBGM();
  };

  const handleCanvasTouchStartOrMove = (e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      if (e.buttons !== 1) return; // Only move on left mouse button held down
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const touchX = clientX - rect.left;
    const touchY = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = touchX - centerX;
    const dy = touchY - centerY;

    const deadZone = 20; // 20px deadzone in center

    touchDirections.current = {
      left: dx < -deadZone,
      right: dx > deadZone,
      up: dy < -deadZone,
      down: dy > deadZone,
    };
  };

  const handleCanvasTouchEnd = () => {
    touchDirections.current = { up: false, down: false, left: false, right: false };
  };

  // Helper to walk automatically to next verse mission
  const handleAutoMoveToNextVerse = () => {
    bgmSynth.playWarpSound();
    const completedIds = player.completedVerseIds;
    const nextVerseId = completedIds.length + 1;
    const nextTarget = pathWaypoints[Math.min(35, nextVerseId - 1)];

    if (nextTarget) {
      setPlayerPos({ x: nextTarget.x, y: nextTarget.y });
    }
  };
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

  // Animation & Movement Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

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
        const length = Math.sqrt(dx * dx + dy * dy);
        const normX = (dx / length) * moveSpeed;
        const normY = (dy / length) * moveSpeed;

        setPlayerPos((prev) => ({
          x: Math.max(40, Math.min(MAP_WIDTH - 40, prev.x + normX)),
          y: Math.max(40, Math.min(MAP_HEIGHT - 40, prev.y + normY)),
        }));

        setWalkFrame((prev) => (prev + 1) % 4);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [moveSpeed]);

  // Check Proximity to Verses and Fruits
  useEffect(() => {
    let nearestGate: BibleVerse | null = null;
    let minDist = 45;

    entities.forEach((entity) => {
      const dist = Math.hypot(entity.x - playerPos.x, entity.y - playerPos.y);

      if (entity.type === 'verse_gate' && entity.verse && dist < minDist) {
        nearestGate = entity.verse;
      }

      if (entity.type === 'fruit' && !entity.collected && dist < 38) {
        bgmSynth.playChime();
        setEntities((prev) =>
          prev.map((e) => (e.id === entity.id ? { ...e, collected: true } : e))
        );
        setCollectedFruits((prev) => prev + 1);
      }
    });

    setActiveGate(nearestGate);
  }, [playerPos, entities]);

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = screenSize.width;
    const height = screenSize.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, width, height);

    // Camera view centered on Player
    const cameraX = Math.max(0, Math.min(MAP_WIDTH - width, playerPos.x - width / 2));
    const cameraY = Math.max(0, Math.min(MAP_HEIGHT - height, playerPos.y - height / 2));

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // 1. Draw Map Image
    if (mapImageRef.current && mapLoaded) {
      ctx.drawImage(mapImageRef.current, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }

    // 2. Draw Mission Path Line
    const gateEntities = entities.filter((e) => e.type === 'verse_gate');
    if (gateEntities.length > 1) {
      ctx.beginPath();
      ctx.setLineDash([10, 6]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      gateEntities.forEach((g, idx) => {
        if (idx === 0) ctx.moveTo(g.x, g.y);
        else ctx.lineTo(g.x, g.y);
      });
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#FDE047';
      gateEntities.forEach((g, idx) => {
        if (idx === 0) ctx.moveTo(g.x, g.y);
        else ctx.lineTo(g.x, g.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw Landmark Labels
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

      if (isNextAvailable) {
        const pulseSize = 28 + Math.sin(Date.now() / 200) * 4;
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isCompleted ? '#16A34A' : isNextAvailable ? '#EAB308' : '#334155';
      ctx.beginPath();
      ctx.arc(entity.x, entity.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isCompleted ? '#86EFAC' : isNextAvailable ? '#FFFFFF' : '#64748B';
      ctx.lineWidth = isNextAvailable ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'black 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isCompleted ? '✓' : `${entity.stationNumber}`, entity.x, entity.y + 4);

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

    // 5. Draw Collectible Fruits
    entities.forEach((entity) => {
      if (entity.type === 'fruit' && !entity.collected) {
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        const fruitEmoji = entity.fruitType === 'lemon' ? '🍋' : entity.fruitType === 'orange' ? '🍊' : '🍎';
        ctx.fillText(fruitEmoji, entity.x, entity.y);
      } else if (entity.type === 'finish_stage') {
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

    // 6. Draw Joined Real-time Students on Map
    joinedStudents.forEach((student, sIdx) => {
      if (student.id === player.id) return; // Drawn separately as active player

      // Position along pathWaypoints based on completedCount
      const stationIdx = Math.min(35, Math.max(0, student.completedCount));
      const targetWp = pathWaypoints[stationIdx] || pathWaypoints[0];

      // Offset slightly per student so they don't overlap completely
      const offsetX = (sIdx % 3) * 18 - 18;
      const offsetY = Math.floor(sIdx / 3) * 16 - 8;
      const studentX = targetWp.x + offsetX;
      const studentY = targetWp.y + offsetY;

      // Draw Student Sprite
      drawPixelSprite(
        ctx,
        student.avatarConfig,
        studentX - 16,
        studentY - 16,
        32,
        'down',
        0,
        false
      );

      // Student Name & Status Tag Bubble
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(studentX - 40, studentY - 32, 80, 14, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#6EE7B7';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(student.name, studentX, studentY - 22);

      // Waiting vs Playing Speech Bubble
      if (gameSessionStatus === 'WAITING') {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
        ctx.beginPath();
        ctx.roundRect(studentX - 30, studentY - 48, 60, 13, 4);
        ctx.fill();
        ctx.fillStyle = '#0F172A';
        ctx.font = 'extrabold 8px sans-serif';
        ctx.fillText('⏳ 대기 중', studentX, studentY - 38);
      } else if (gameSessionStatus === 'PLAYING') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
        ctx.beginPath();
        ctx.roundRect(studentX - 35, studentY - 48, 70, 13, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'extrabold 8px sans-serif';
        ctx.fillText(`📖 #${student.completedCount + 1}구절`, studentX, studentY - 38);
      }
    });

    // 7. Draw Player Character Avatar
    const hasAura = player.equippedItems.includes('helmet_salvation');
    drawPixelSprite(
      ctx,
      player.character,
      playerPos.x - 20,
      playerPos.y - 20,
      40,
      direction,
      walkFrame,
      hasAura
    );

    // Player Name Tag & Indicator Ring
    ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y + 18, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(playerPos.x - 45, playerPos.y - 36, 90, 16, 6);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FEF08A';
    ctx.font = 'extrabold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.name} (나)`, playerPos.x, playerPos.y - 24);

    ctx.restore();
  }, [playerPos, direction, walkFrame, mapLoaded, entities, player, joinedStudents, gameSessionStatus, screenSize]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 select-none touch-none">
      {/* 2D Canvas Viewport with Touch / Drag Movement */}
      <canvas
        ref={canvasRef}
        onTouchStart={handleCanvasTouchStartOrMove}
        onTouchMove={handleCanvasTouchStartOrMove}
        onTouchEnd={handleCanvasTouchEnd}
        onMouseDown={handleCanvasTouchStartOrMove}
        onMouseMove={handleCanvasTouchStartOrMove}
        onMouseUp={handleCanvasTouchEnd}
        className="block w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* MOBILE GAME TOP HUD & CONTROL BAR */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        
        {/* TOP LEFT: MOBILE PLAYER PROFILE & FAITH STATS CARD */}
        <div className="pointer-events-auto bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between sm:justify-start gap-2 sm:gap-3 max-w-full">
          {/* Avatar Thumbnail */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-950 border-2 border-amber-400 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
              <SpriteCanvas
                config={player.character}
                width={36}
                height={36}
                direction="down"
              />
            </div>
            {/* Level Badge */}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-md border border-slate-900 shadow">
              Lv.{Math.floor(player.completedVerseIds.length / 3) + 1}
            </span>
          </div>

          {/* Name & Stats */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[90px] sm:max-w-[120px]">
                {player.name}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                {player.grade}
              </span>
            </div>

            {/* Hearts & Score */}
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5 text-rose-400">
                <Heart className="w-3 h-3 fill-current animate-pulse" />
                <Heart className="w-3 h-3 fill-current" />
                <Heart className="w-3 h-3 fill-current" />
              </div>

              <div className="flex items-center gap-1 text-amber-300 text-[10px] sm:text-xs font-black">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>{player.score}P</span>
              </div>

              <div className="text-[10px] text-emerald-400 font-bold ml-1">
                {player.completedVerseIds.length}/36 완송
              </div>
            </div>
          </div>

          {/* PRAISE BGM AUDIO TOGGLE BUTTON */}
          <button
            onClick={handleToggleBgm}
            className={`pointer-events-auto shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 border shadow-lg ${
              isBgmPlaying
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40'
            }`}
            title="어린이 찬양 배경음악 켜기/끄기"
          >
            {isBgmPlaying ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce text-slate-950" />
                <span className="hidden sm:inline text-[11px]">찬양 BGM ON</span>
                <span className="sm:hidden text-[10px]">BGM ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline text-[11px]">찬양 BGM OFF</span>
                <span className="sm:hidden text-[10px]">BGM OFF</span>
              </>
            )}
          </button>
        </div>

        {/* TOP RIGHT: TEACHER SESSION & DASHBOARD CONTROLS */}
        <div className="pointer-events-auto bg-slate-900/90 border border-amber-500/40 rounded-2xl p-1.5 sm:p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          {/* Game Status Badge */}
          <div className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400 hidden sm:block" />
            <span
              className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                gameSessionStatus === 'WAITING'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : gameSessionStatus === 'PLAYING'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-purple-600 text-white'
              }`}
            >
              {gameSessionStatus === 'WAITING'
                ? '⏳ 대기'
                : gameSessionStatus === 'PLAYING'
                ? '🟢 진행중'
                : '🏆 종료됨'}
            </span>
          </div>

          {/* Teacher Game Session Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={onOpenQRModal}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-1 rounded-xl text-[10px] sm:text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              <QrCode className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>QR</span>
            </button>

            <div className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{joinedStudents.length}명</span>
            </div>

            {gameSessionStatus === 'WAITING' && (
              <button
                onClick={onStartGameSession}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1 rounded-xl text-[10px] sm:text-xs shadow-lg transition cursor-pointer active:scale-95 animate-bounce"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>시작</span>
              </button>
            )}

            {gameSessionStatus === 'PLAYING' && (
              <button
                onClick={onEndGameSession}
                className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white font-black px-2.5 py-1 rounded-xl text-[10px] sm:text-xs shadow-lg transition cursor-pointer active:scale-95"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>종료</span>
              </button>
            )}

            {gameSessionStatus === 'ENDED' && (
              <button
                onClick={onOpenAwardCeremony}
                className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl text-[10px] sm:text-xs shadow-lg transition cursor-pointer active:scale-95"
              >
                <Award className="w-3 h-3" />
                <span>시상식</span>
              </button>
            )}

            <button
              onClick={onOpenDashboard}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-xl border border-slate-700 transition cursor-pointer active:scale-95 shrink-0"
              title="실시간 현황 대시보드"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DEVELOPER CREDIT BADGE */}
      <div className="absolute top-16 right-2 sm:top-20 sm:right-4 z-20 pointer-events-none bg-slate-900/80 border border-amber-500/30 text-amber-200/90 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md backdrop-blur-sm">
        개발자: Gabriel Byeongje Jeon
      </div>

      {/* Waiting Lobby Overlay Alert when Waiting */}
      {gameSessionStatus === 'WAITING' && (
        <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-2.5 sm:p-4 text-center max-w-xs sm:max-w-sm w-11/12 shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center gap-1 text-amber-400 text-xs font-extrabold mb-0.5">
            <Sparkles className="w-3.5 h-3.5" /> 게임 시작 대기 중 <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-[10px] sm:text-xs text-slate-300">
            QR코드로 학생들을 가나안 복지에 초대하세요. 상단 <strong className="text-emerald-400">‘시작’</strong> 버튼을 누르면 정식 암송 미션이 시작됩니다.
          </p>
        </div>
      )}

      {/* VIRTUAL D-PAD TOUCH CONTROLLER FOR MOBILE SMARTPHONES */}
      <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 z-30 flex flex-col items-center gap-1 touch-manipulation select-none">
        <div className="bg-slate-900/90 border border-amber-500/40 text-amber-300 font-extrabold px-2 py-0.5 rounded-full text-[10px] shadow-md mb-0.5 pointer-events-none">
          🎮 방향키로 이동
        </div>

        <button
          onTouchStart={(e) => { e.preventDefault(); touchDirections.current.up = true; }}
          onTouchEnd={(e) => { e.preventDefault(); touchDirections.current.up = false; }}
          onMouseDown={() => (touchDirections.current.up = true)}
          onMouseUp={() => (touchDirections.current.up = false)}
          onMouseLeave={() => (touchDirections.current.up = false)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/95 hover:bg-amber-500/30 border-2 border-amber-400 active:bg-amber-500 active:text-slate-950 text-amber-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md transition active:scale-90 cursor-pointer"
          aria-label="위로 이동"
        >
          <ArrowUp className="w-7 h-7 stroke-[3]" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onTouchStart={(e) => { e.preventDefault(); touchDirections.current.left = true; }}
            onTouchEnd={(e) => { e.preventDefault(); touchDirections.current.left = false; }}
            onMouseDown={() => (touchDirections.current.left = true)}
            onMouseUp={() => (touchDirections.current.left = false)}
            onMouseLeave={() => (touchDirections.current.left = false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/95 hover:bg-amber-500/30 border-2 border-amber-400 active:bg-amber-500 active:text-slate-950 text-amber-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md transition active:scale-90 cursor-pointer"
            aria-label="왼쪽으로 이동"
          >
            <ArrowLeft className="w-7 h-7 stroke-[3]" />
          </button>

          {/* Quick Auto-Walk Button to Next Verse */}
          <button
            onClick={handleAutoMoveToNextVerse}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/30 border-2 border-amber-400 active:bg-amber-500 text-amber-300 active:text-slate-950 rounded-2xl flex flex-col items-center justify-center text-[10px] font-black shadow-xl transition active:scale-90 cursor-pointer"
            title="다음 말씀 구절 위치로 자동 이동"
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span>워프</span>
          </button>

          <button
            onTouchStart={(e) => { e.preventDefault(); touchDirections.current.right = true; }}
            onTouchEnd={(e) => { e.preventDefault(); touchDirections.current.right = false; }}
            onMouseDown={() => (touchDirections.current.right = true)}
            onMouseUp={() => (touchDirections.current.right = false)}
            onMouseLeave={() => (touchDirections.current.right = false)}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/95 hover:bg-amber-500/30 border-2 border-amber-400 active:bg-amber-500 active:text-slate-950 text-amber-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md transition active:scale-90 cursor-pointer"
            aria-label="오른쪽으로 이동"
          >
            <ArrowRight className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        <button
          onTouchStart={(e) => { e.preventDefault(); touchDirections.current.down = true; }}
          onTouchEnd={(e) => { e.preventDefault(); touchDirections.current.down = false; }}
          onMouseDown={() => (touchDirections.current.down = true)}
          onMouseUp={() => (touchDirections.current.down = false)}
          onMouseLeave={() => (touchDirections.current.down = false)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900/95 hover:bg-amber-500/30 border-2 border-amber-400 active:bg-amber-500 active:text-slate-950 text-amber-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md transition active:scale-90 cursor-pointer"
          aria-label="아래로 이동"
        >
          <ArrowDown className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Active Gate Quick Interaction Bar */}
      {activeGate && gameSessionStatus !== 'ENDED' && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-2.5 sm:p-4 max-w-xs sm:max-w-sm w-11/12 shadow-2xl backdrop-blur-md text-white flex items-center justify-between gap-2 animate-bounce">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] text-amber-400 font-extrabold uppercase tracking-wide block">
              미션 #{activeGate.id} 구절 포착!
            </span>
            <p className="text-[11px] sm:text-xs font-bold text-amber-200 truncate">[주제: {activeGate.theme}]</p>
          </div>
          <button
            onClick={() => onOpenQuiz(activeGate!)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs shadow-lg transition shrink-0 cursor-pointer active:scale-95 flex items-center gap-1 min-h-[36px]"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>암송 풀기</span>
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT: MOBILE GAME ACTION BUTTON CLUSTER */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-30 flex items-end gap-2.5 touch-manipulation">
        {/* Secondary Action Buttons (Armor & AI Tutor) */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenItemInventory}
            className="bg-slate-900/90 border-2 border-slate-700 hover:border-amber-400 text-amber-300 font-bold px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-2xl backdrop-blur-md transition cursor-pointer active:scale-90"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] sm:text-xs">갑주</span>
          </button>

          <button
            onClick={onOpenAIHelp}
            className="bg-purple-900/90 border-2 border-purple-500/60 hover:bg-purple-600 text-white font-extrabold px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-2xl backdrop-blur-md transition cursor-pointer active:scale-90"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-[11px] sm:text-xs">AI튜터</span>
          </button>
        </div>

        {/* Primary Arcade Action [A] & [B] Buttons */}
        <div className="flex items-center gap-2">
          {/* B Button: Warp / Navigation */}
          <button
            onClick={handleAutoMoveToNextVerse}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-600/30 border-2 border-amber-500/80 active:bg-amber-500 text-amber-300 active:text-slate-950 rounded-full flex flex-col items-center justify-center font-black shadow-2xl backdrop-blur-md transition active:scale-90"
            title="다음 말씀으로 이동"
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">B 워프</span>
          </button>

          {/* A Button: Interact / 암송 풀기 */}
          <button
            disabled={!activeGate}
            onClick={() => activeGate && onOpenQuiz(activeGate)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center font-black shadow-2xl transition active:scale-90 ${
              activeGate
                ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 border-4 border-amber-300 shadow-amber-500/50 animate-pulse cursor-pointer'
                : 'bg-slate-900/80 border-2 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-[10px] sm:text-xs font-black">A 암송</span>
          </button>
        </div>
      </div>
    </div>
  );
};
