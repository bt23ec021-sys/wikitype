import type { Passage, PassageLength } from '../types'
import { selectPassage } from '../utils/textProcessor'

// Original WikiType editorial copy, dedicated to the public domain (CC0-1.0).
// These samples are NOT represented as Wikipedia article text.
const samples = [
  {
    title: 'The Quiet Observatory',
    content: 'On a clear night, the small observatory above the village opened its roof to the stars. The telescope moved slowly across the sky while students recorded the positions of bright planets. Each observation began with a question and ended with another. A patient observer might notice a faint moon, a changing shadow, or the soft glow of a distant galaxy. The notebooks contained careful measurements, sketches, and stories about unexpected discoveries. After midnight, the group closed the dome and carried their questions home. Learning to look closely had changed the way they saw ordinary daylight, too. They learned that science depends not only on sophisticated instruments but also on attention, curiosity, and the courage to revise an explanation.',
  },
  {
    title: 'A City of Small Gardens',
    content: 'Between the tall buildings, residents began planting tiny gardens in neglected corners. Some chose herbs and vegetables, while others grew flowers that welcomed bees. The gardens soon became places where neighbors exchanged tools, ideas, and seasonal recipes. A child mapped the butterflies that visited in spring, and an engineer built a simple system to collect rainwater. Although each plot was small, together they made the streets feel more welcoming. People learned which plants tolerated heat and which needed the shelter of a shaded wall. Over several seasons, the project brought people together through ordinary, practical care. The gardens became living classrooms, offering lessons about soil, weather, patience, and the value of shared public spaces.',
  },
  {
    title: 'The Library on the Hill',
    content: 'Every morning, the library on the hill opened its wide wooden doors before the market became busy. Readers arrived looking for maps, novels, local histories, and answers to surprising questions. One shelf held books about oceans, and another held stories from travelers who had crossed enormous deserts. During rainy afternoons, the librarian organized short talks where visitors explained something they had recently learned. The room was quiet, but it was never still. Ideas moved from one person to another, changing shape as they traveled. A good library provides more than information: it gives people time and space to explore possibilities. At sunset, the lamps came on, and a few students continued reading beside the windows until closing time.',
  },
]
export function offlinePassage(length: PassageLength, index = 0): Passage {
  const item = samples[((index % samples.length) + samples.length) % samples.length]!
  const text = selectPassage(item.content, length) ?? item.content
  return { id: `offline-${index}-${length}`, title: item.title, text, source: 'offline', adapted: text !== item.content, license: 'CC0-1.0' }
}
