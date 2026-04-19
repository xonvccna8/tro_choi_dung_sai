export type GoogleSearchResult = {
  title: string;
  snippet: string;
  link: string;
  note: string;
};

export async function searchChemistryExercises(query: string): Promise<GoogleSearchResult[]> {
  const res = await fetch(`/api/curated-search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Tìm kiếm thất bại.');
  return data.items as GoogleSearchResult[];
}
