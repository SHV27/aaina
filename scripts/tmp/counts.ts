import { DIMENSIONS } from '../../src/engine/dimensions'
import { PRACTICES } from '../../src/engine/practices'
import { SOURCES } from '../../src/engine/sources'
import { ALL_ITEMS, SAFETY_ITEMS, totalItems } from '../../src/items'
import { arjun, rohit } from '../../src/engine/fixtures'
console.log('dimensions', DIMENSIONS.length)
console.log('  relationship', DIMENSIONS.filter(d=>d.lens==='relationship').length,
            '| self', DIMENSIONS.filter(d=>d.lens==='self').length,
            '| both', DIMENSIONS.filter(d=>d.lens==='both').length)
console.log('practices', PRACTICES.length, '| sources', Object.keys(SOURCES).length)
console.log('items', ALL_ITEMS.length, '(+', SAFETY_ITEMS.length, 'safety)')
console.log('asked — relationship', totalItems(arjun().context), '| self', totalItems(rohit().context))
