const palette = [
  { background: '#dbeafe', border: '#2563eb', text: '#1e3a8a' },
  { background: '#dcfce7', border: '#16a34a', text: '#14532d' },
  { background: '#fef3c7', border: '#d97706', text: '#78350f' },
  { background: '#fce7f3', border: '#db2777', text: '#831843' },
  { background: '#ede9fe', border: '#7c3aed', text: '#4c1d95' },
  { background: '#cffafe', border: '#0891b2', text: '#164e63' },
  { background: '#ffedd5', border: '#ea580c', text: '#7c2d12' },
  { background: '#e0e7ff', border: '#4f46e5', text: '#312e81' },
  { background: '#ccfbf1', border: '#0d9488', text: '#134e4a' },
  { background: '#ffe4e6', border: '#e11d48', text: '#881337' },
];

// Hash the stable ID, not the selection index, so colors survive reorder/refresh.
export const getCourseColor = (id: string) => {
  let hash = 2166136261;
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return palette[hash % palette.length];
};
