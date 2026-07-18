// ------------------------------------------------------------------
// EDIT ME: your yearly beer-count ranks. Sorted low to high; the
// highest threshold you've reached this year is your current rank.
// ------------------------------------------------------------------
export const BEER_GRADES = [
  { count: 0, label: 'Rookie' },
  { count: 10, label: 'Apprentice' },
  { count: 20, label: 'Tavern Sprite' },
  { count: 30, label: 'Barrel Squire' },
  { count: 40, label: 'Regular' },
  { count: 50, label: "Landlord's Favorite" },
  { count: 60, label: 'Tavern Local' },
  { count: 70, label: 'Court Jester' },
  { count: 80, label: 'Deckhand' },
  { count: 90, label: 'First Mate' },
  { count: 100, label: 'Irish Leprechaun' },
  { count: 110, label: "Ship's Cooper" },
  { count: 120, label: 'Highland Chieftain' },
  { count: 130, label: 'Knight of the Round Table' },
  { count: 140, label: "The King's Cupbearer" },
  { count: 150, label: 'Dragon Slayer' },
  { count: 160, label: 'Gnome of the Cellar' },
  { count: 170, label: 'Beer Elf' },
  { count: 180, label: 'The Green Man' },
  { count: 190, label: 'Norse Skald' },
  { count: 200, label: 'Caribbean Pirate' },
  { count: 210, label: 'Viking Berserker' },
  { count: 220, label: 'Buccaneer' },
  { count: 230, label: 'Admiral of the Ale' },
  { count: 240, label: 'Kraken Wrangler' },
  { count: 250, label: 'Jedi Master' },
  { count: 260, label: 'Sith Lord' },
  { count: 270, label: 'Time Lord' },
  { count: 280, label: 'Highlander' },
  { count: 290, label: 'Gandalf the Grey(hound)' },
  { count: 300, label: 'Monsieur Beaucaire' },
  { count: 310, label: '007 (Licensed to Chill)' },
  { count: 320, label: 'Sensei' },
  { count: 330, label: 'Local Hero' },
  { count: 340, label: 'Legend of the Bar' },
  { count: 350, label: 'Myth' },
  { count: 360, label: 'Living Legend' },
  { count: 370, label: 'Bar Deity' },
  { count: 380, label: 'The One Who Knocks' },
  { count: 390, label: 'Beer Pope' },
  { count: 400, label: 'The Chosen One' }
]

export function getBeerGrade(total) {
  let current = null
  for (const grade of BEER_GRADES) {
    if (total >= grade.count) current = grade
  }
  return current
}
