export interface VibePreset {
  id: string;
  name: string;
  badge: string;
  genre: string;
  vocal: string;
  bpm: number;
  mood: string;
  instruments: string[];
  topic: string;
  language: string;
}

export interface SongConfig {
  genre: string;
  vocal: string;
  bpm: number;
  mood: string;
  instruments: string[];
  topic: string;
  language: string;
  sunoVersion: string;
}

export interface GeneratedResult {
  styleTags: string;
  lyricsAndStructure: string;
  proTips: string[];
  source: 'gemini' | 'curated-fallback';
}

export interface HistoryItem {
  id: number;
  date: string;
  genre: string;
  bpm: number;
  styleTags: string;
  lyricsAndStructure: string;
}

export type ActiveTab = 'style' | 'lyrics' | 'audio' | 'thumbnail' | 'youtubeSeo' | 'uploadTime' | 'tips';

export interface YoutubeSeoData {
  videoTitle: string;
  description: string;
  tags: string[];
  algorithmTips: string[];
}
