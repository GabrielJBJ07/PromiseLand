import React, { useState, useEffect } from 'react';
import { PlayerStats, BibleVerse, GameItem, LeaderboardEntry, Grade } from './types';
import { CharacterCreator } from './components/CharacterCreator';
import { MetaverseMap } from './components/MetaverseMap';
import { ZepQuizModal } from './components/ZepQuizModal';
import { QRCodeModal } from './components/QRCodeModal';
import { ItemRewardModal } from './components/ItemRewardModal';
import { ItemInventoryModal } from './components/ItemInventoryModal';
import { Dashboard } from './components/Dashboard';
import { CertificateModal } from './components/CertificateModal';
import { AwardCeremonyModal } from './components/AwardCeremonyModal';
import { AIBibleTutor } from './components/AIBibleTutor';
import { GAME_ITEMS } from './data/items';
import { CHARACTER_PRESETS } from './utils/spriteGenerator';

export default function App() {
  const [player, setPlayer] = useState<PlayerStats | null>(() => {
    const saved = localStorage.getItem('promised_land_player');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Game Session Status controlled by Teacher
  const [gameSessionStatus, setGameSessionStatus] = useState<'WAITING' | 'PLAYING' | 'ENDED'>('WAITING');
  
  // Joined students list (Initially empty per user directive: "미리 참여해 있는 학생이 없도록 해줘")
  const [joinedStudents, setJoinedStudents] = useState<LeaderboardEntry[]>([]);

  // Modal states
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAwardCeremonyOpen, setIsAwardCeremonyOpen] = useState(false);

  const [activeQuizVerse, setActiveQuizVerse] = useState<BibleVerse | null>(null);
  const [rewardItem, setRewardItem] = useState<GameItem | null>(null);
  const [certificateData, setCertificateData] = useState<{ name: string; grade: string; completedCount?: number; isAll?: boolean } | null>(null);

  // Sync player to joinedStudents roster
  useEffect(() => {
    if (!player) return;

    setJoinedStudents((prev) => {
      const exists = prev.some((s) => s.id === player.id);
      const playerEntry: LeaderboardEntry = {
        rank: 1,
        id: player.id,
        name: player.name,
        grade: player.grade,
        characterName: player.character.name,
        completedCount: player.completedVerseIds.length,
        score: player.score,
        streak: player.streak,
        equippedItemCount: player.equippedItems.length,
        avatarConfig: player.character,
      };

      if (!exists) {
        return [...prev, playerEntry];
      } else {
        return prev.map((s) => (s.id === player.id ? playerEntry : s));
      }
    });

    localStorage.setItem('promised_land_player', JSON.stringify(player));
  }, [player]);

  const handleStartGame = (newPlayer: PlayerStats) => {
    setPlayer(newPlayer);
  };

  // Teacher Game Session Handlers
  const handleStartGameSession = () => {
    setGameSessionStatus('PLAYING');
  };

  const handleEndGameSession = () => {
    setGameSessionStatus('ENDED');
    setIsAwardCeremonyOpen(true);
  };

  const handleResetGameSession = () => {
    setGameSessionStatus('WAITING');
    setIsAwardCeremonyOpen(false);
  };

  // Teacher Helper to add simulation student for testing QR/Roster feature
  const handleAddDemoStudent = () => {
    const demoNames = ['박여호수아', '김믿음', '이신앙', '최소망', '한사랑', '강주은', '임하준', '윤다은'];
    const demoGrades: Grade[] = ['4학년', '5학년', '6학년'];
    const idx = joinedStudents.length;

    const name = demoNames[idx % demoNames.length] + ` (${idx + 1})`;
    const grade = demoGrades[idx % demoGrades.length];
    const preset = CHARACTER_PRESETS[idx % CHARACTER_PRESETS.length];

    const newStudent: LeaderboardEntry = {
      rank: idx + 1,
      id: `sim_student_${Date.now()}_${idx}`,
      name,
      grade,
      characterName: preset.name,
      completedCount: Math.min(36, Math.floor(Math.random() * 15) + 3),
      score: Math.floor(Math.random() * 2500) + 500,
      streak: Math.floor(Math.random() * 7) + 1,
      equippedItemCount: Math.floor(Math.random() * 3),
      avatarConfig: preset,
    };

    setJoinedStudents((prev) => [...prev, newStudent]);
  };

  const handleRemoveStudent = (studentId: string) => {
    setJoinedStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const handleCompleteVerse = (verseId: number, earnedPoints: number) => {
    if (!player) return;

    if (player.completedVerseIds.includes(verseId)) {
      setPlayer((prev) => (prev ? { ...prev, score: prev.score + earnedPoints } : prev));
      return;
    }

    const newCompleted = [...player.completedVerseIds, verseId];
    const newCount = newCompleted.length;
    const newScore = player.score + earnedPoints + player.streak * 20;
    const newStreak = player.streak + 1;

    const milestoneItem = GAME_ITEMS.find((item) => item.milestoneVerseCount === newCount);

    setPlayer((prev) => {
      if (!prev) return prev;
      const updatedUnlocked = milestoneItem
        ? [...prev.itemsUnlocked, milestoneItem.id]
        : prev.itemsUnlocked;
      const updatedEquipped = milestoneItem
        ? [...prev.equippedItems, milestoneItem.id]
        : prev.equippedItems;

      return {
        ...prev,
        completedVerseIds: newCompleted,
        score: newScore,
        streak: newStreak,
        itemsUnlocked: updatedUnlocked,
        equippedItems: updatedEquipped,
        currentStage: Math.min(5, Math.floor(newCount / 7) + 1),
      };
    });

    if (milestoneItem) {
      setRewardItem(milestoneItem);
    }
  };

  const handleToggleEquipItem = (itemId: string) => {
    if (!player) return;
    setPlayer((prev) => {
      if (!prev) return prev;
      const isEquipped = prev.equippedItems.includes(itemId);
      const newEquipped = isEquipped
        ? prev.equippedItems.filter((id) => id !== itemId)
        : [...prev.equippedItems, itemId];
      return { ...prev, equippedItems: newEquipped };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Login / Character Creator Screen */}
      {!player ? (
        <CharacterCreator
          onStartGame={handleStartGame}
          onOpenQRModal={() => setIsQRModalOpen(true)}
        />
      ) : (
        /* 2. Main Metaverse Map Gameplay with Teacher Live Monitoring */
        <MetaverseMap
          player={player}
          joinedStudents={joinedStudents}
          gameSessionStatus={gameSessionStatus}
          onStartGameSession={handleStartGameSession}
          onEndGameSession={handleEndGameSession}
          onOpenAwardCeremony={() => setIsAwardCeremonyOpen(true)}
          onOpenQRModal={() => setIsQRModalOpen(true)}
          onOpenQuiz={(verse) => setActiveQuizVerse(verse)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onOpenAIHelp={() => setIsAIHelpOpen(true)}
          onOpenItemInventory={() => setIsInventoryOpen(true)}
        />
      )}

      {/* Overlays and Modals */}
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

      {activeQuizVerse && (
        <ZepQuizModal
          verse={activeQuizVerse}
          isOpen={!!activeQuizVerse}
          onClose={() => setActiveQuizVerse(null)}
          onCompleteVerse={handleCompleteVerse}
          hasShieldItem={player?.equippedItems.includes('shield_faith')}
        />
      )}

      <ItemRewardModal
        item={rewardItem}
        isOpen={!!rewardItem}
        onClose={() => setRewardItem(null)}
        onEquipItem={handleToggleEquipItem}
      />

      {player && (
        <ItemInventoryModal
          player={player}
          isOpen={isInventoryOpen}
          onClose={() => setIsInventoryOpen(false)}
          onToggleEquip={handleToggleEquipItem}
        />
      )}

      {player && (
        <Dashboard
          player={player}
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onOpenCertificate={(name, grade) => setCertificateData({ name, grade })}
          onOpenAllCertificates={() => {
            const first = joinedStudents[0] || { name: player.name, grade: player.grade, completedCount: player.completedVerseIds.length };
            setCertificateData({ name: first.name, grade: first.grade, completedCount: first.completedCount, isAll: true });
          }}
          joinedStudents={joinedStudents}
          onAddDemoStudent={handleAddDemoStudent}
          onRemoveStudent={handleRemoveStudent}
          onOpenQRModal={() => setIsQRModalOpen(true)}
        />
      )}

      <AwardCeremonyModal
        isOpen={isAwardCeremonyOpen}
        onClose={() => setIsAwardCeremonyOpen(false)}
        students={joinedStudents}
        onOpenCertificate={(name, grade) => setCertificateData({ name, grade })}
        onOpenAllCertificates={() => {
          const first = joinedStudents[0] || { name: player.name, grade: player.grade, completedCount: player.completedVerseIds.length };
          setCertificateData({ name: first.name, grade: first.grade, completedCount: first.completedCount, isAll: true });
        }}
        onResetGame={handleResetGameSession}
      />

      {certificateData && (
        <CertificateModal
          studentName={certificateData.name}
          grade={certificateData.grade}
          completedCount={certificateData.completedCount ?? (player?.completedVerseIds.length || 0)}
          isOpen={!!certificateData}
          onClose={() => setCertificateData(null)}
          allStudents={joinedStudents}
        />
      )}

      <AIBibleTutor isOpen={isAIHelpOpen} onClose={() => setIsAIHelpOpen(false)} />
    </div>
  );
}
