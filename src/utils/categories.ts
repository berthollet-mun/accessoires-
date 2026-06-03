export const CATEGORY_OPTIONS = [
  { value: 'SHORTS', label: 'Culottes / shorts' },
  { value: 'UNDERWEAR', label: 'Sous-vetements' },
  { value: 'SOCKS', label: 'Soks' },
  { value: 'FOOTWEAR', label: 'Souliers' },
  { value: 'LOUNGE', label: 'Lounge' },
] satisfies Array<{ value: string; label: string }>;

const CATEGORY_LABELS = new Map(
  CATEGORY_OPTIONS.map((category) => [category.value, category.label]),
);

export function getCategoryLabel(category: string | null | undefined) {
  if (!category) return 'Sans categorie';
  return CATEGORY_LABELS.get(category) ?? category;
}

export function sortCategories(categories: string[]) {
  const order = new Map(CATEGORY_OPTIONS.map((category, index) => [category.value, index]));
  return [...categories].sort((a, b) => {
    const orderA = order.get(a) ?? 999;
    const orderB = order.get(b) ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return getCategoryLabel(a).localeCompare(getCategoryLabel(b));
  });
}
