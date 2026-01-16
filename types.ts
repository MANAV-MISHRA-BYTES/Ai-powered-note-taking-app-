
import React from 'react';

export type BlockType = 'text' | 'heading1' | 'heading2' | 'heading3' | 'image' | 'pdf';

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  alignment: 'left' | 'center' | 'right' | 'justify';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  color: string;
  bold?: boolean;
  italic?: boolean;
}

export interface Note {
  id: string;
  title: string;
  blocks: Block[];
  drawings: DrawingPath[];
  createdAt: number;
  updatedAt: number;
  tags: string[];
  isFavorite: boolean;
}

export interface AIAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}
