import React, { useState, useEffect } from 'react';
import { PlayerStats, BibleVerse, GameItem } from './types';
import { CharacterCreator } from './components/CharacterCreator';
import { MetaverseMap } from './components/MetaverseMap';
import { ZepQuizModal } from './components/ZepQuizModal';
import { QRCodeModal } from './components/QRCodeModal';
import { ItemRewardModal } from './components/ItemRewardModal';
import { ItemInventoryModal } from './components/ItemInventoryModal';
import { Dashboard } from './components/Dashboard';
import { CertificateModal } from './components/CertificateModal';
import { AIBibleTutor } from './components/AIBibleTutor';
import { GAME_ITEMS } from './data/items';

export default function App() {
  const [player, setPlayer] = useState<PlayerStats | null>(() => {
    // Load from local storage if existing
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

  // Modal states
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const [activeQuizVerse, setActiveQuizVerse] = useState<BibleVerse | null>(null);
  const [rewardItem, setRewardItem] = useState<GameItem | null>(null);
  const [certificateData, setCertificateData] = useState<{ name: string; grade: string } | null>(null);

  // Save player state to localStorage
  useEffect(() => {
    if (player) {
      localStorage.setItem('promised_land_player', JSON.stringify(player));
    }
  }, [player]);

  const handleStartGame = (newPlayer: PlayerStats) => {
    setPlayer(newPlayer);
  };

  const handleCompleteVerse = (verseId: number, earnedPoints: number) => {
    if (!player) return;

    if (player.completedVerseIds.includes(verseId)) {
      // Verse already completed previously, just add points
      setPlayer((prev) => (prev ? { ...prev, score: prev.score + earnedPoints } : prev));
      return;
    }

    const newCompleted = [...player.completedVerseIds, verseId];
    const newCount = newCompleted.length;
    const newScore = player.score + earnedPoints + player.streak * 20;
    const newStreak = player.streak + 1;

    // Check if 5-verse milestone item is unlocked!
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
        /* 2. Main Metaverse Map Gameplay */
        <MetaverseMap
          player={player}
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
        />
      )}

      {certificateData && player && (
        <CertificateModal
          studentName={certificateData.name}
          grade={certificateData.grade}
          completedCount={player.completedVerseIds.length}
          isOpen={!!certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}

      <AIBibleTutor isOpen={isAIHelpOpen} onClose={() => setIsAIHelpOpen(false)} />
    </div>
  );
}
