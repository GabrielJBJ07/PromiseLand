export type Grade = '4학년' | '5학년' | '6학년';

export interface BibleVerse {
  id: number;
  dateRange: string;
  reference: string; // e.g. "고린도후서 5:17"
  text: string;      // Full Korean text
  keywords: string[]; // Key words to highlight or use in quiz
  theme: string;     // e.g. "새로운 피조물", "십자가", "예배"
  stageId: number;   // 1 to 5 (maps to Promised Land stages)
}

export interface CharacterPreset {
  id: string;
  name: string;      // e.g., "여호수아", "모세", "에스더", "다윗", "바울", "마리아"
  title: string;     // e.g., "믿음의 용사"
  hairColor: string;
  skinColor: string;
  outfitColor: string;
  hatType: 'none' | 'tunic' | 'crown' | 'pirate_hat' | 'helmet' | 'turban' | 'ribbon';
  accessory: 'none' | 'staff' | 'shield' | 'sword' | 'scroll' | 'harp' | 'branch';
}

export interface PlayerStats {
  id: string;
  name: string;
  grade: Grade;
  character: CharacterPreset;
  completedVerseIds: number[];
  score: number;
  streak: number;
  equippedItems: string[];
  itemsUnlocked: string[];
  lastActive: string;
  currentStage: number; // 1 to 5
}

export interface GameItem {
  id: string;
  name: string;
  milestoneVerseCount: number; // 5, 10, 15, 20, 25, 30, 35, 36
  icon: string;
  description: string;
  category: 'armor' | 'weapon' | 'accessory' | 'pet' | 'blessing';
  effectText: string;
  speedBonus?: number;
}

export type QuizType = 'word_order' | 'blank_fill' | 'reference_match';

export interface QuizQuestion {
  id: string;
  verse: BibleVerse;
  type: QuizType;
  questionPrompt: string;
  // For word_order:
  words?: string[];
  correctWordOrder?: string[];
  // For blank_fill:
  blanksText?: string; // Text with ___
  blankOptions?: string[];
  correctBlankAnswers?: string[];
  // For multi choice / reference match:
  options?: string[];
  correctAnswer?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  grade: Grade;
  characterName: string;
  completedCount: number;
  score: number;
  streak: number;
  equippedItemCount: number;
  avatarConfig: CharacterPreset;
}
