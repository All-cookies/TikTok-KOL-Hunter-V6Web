import { Creator, SavedCreator } from '../types';

const SAVED_KEY = 'kol-hunter-saved';

export function getSavedCreators(): SavedCreator[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCreator(creator: Creator): SavedCreator {
  const saved: SavedCreator = {
    ...creator,
    savedAt: Date.now(),
    tags: [],
    notes: '',
  };
  const existing = getSavedCreators();
  const filtered = existing.filter(c => c.unique_id !== creator.unique_id);
  const updated = [saved, ...filtered];
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  return saved;
}

export function removeCreator(uniqueId: string): void {
  const existing = getSavedCreators();
  const updated = existing.filter(c => c.unique_id !== uniqueId);
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
}

export function updateCreatorTags(uniqueId: string, tags: string[]): void {
  const existing = getSavedCreators();
  const updated = existing.map(c =>
    c.unique_id === uniqueId ? { ...c, tags } : c
  );
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
}

export function updateCreatorNotes(uniqueId: string, notes: string): void {
  const existing = getSavedCreators();
  const updated = existing.map(c =>
    c.unique_id === uniqueId ? { ...c, notes } : c
  );
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
}

export function isCreatorSaved(uniqueId: string): boolean {
  const saved = getSavedCreators();
  return saved.some(c => c.unique_id === uniqueId);
}
