// ------------------------------------------------------------------
// EDIT ME: distinct-pub milestones. Sorted low to high; the highest
// threshold you've reached this year is your current title. Keep the
// label SHORT — it's shown as a small badge, not a headline.
// ------------------------------------------------------------------
export const PUB_MILESTONES = [
  { count: 1, label: 'First Round' },
  { count: 3, label: 'Explorer' },
  { count: 5, label: 'Crawler' },
  { count: 10, label: 'Nomad' }
]

export function getPubMilestone(count) {
  let current = null
  for (const m of PUB_MILESTONES) {
    if (count >= m.count) current = m
  }
  return current
}
