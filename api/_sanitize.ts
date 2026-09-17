/**
 * Prose sanitising.
 *
 * Evidence ids belong in the `evidenceIds` array, never in the prose. A live run of the real
 * prompt had the model writing "(ev:item:txt_fear)" into the middle of sentences — unreadable,
 * and worse, it was attaching ids to claims they did not actually support. So the text is
 * stripped of ids and the array is validated separately: the prose never gets to carry its own
 * citations, and the citations never get to be decorative.
 */

const ID_IN_BRACKETS = /\s*[([]\s*(?:ev:[A-Za-z0-9:_-]+\s*[,;]?\s*)+[)\]]/g
const BARE_ID = /\s*\bev:[A-Za-z0-9:_-]+/g
const SPACE_BEFORE_PUNCT = /\s+([,.;:!?])/g
const RUN_OF_SPACES = /[^\S\r\n]{2,}/g
/** Models sometimes emit a markdown heading or bullet despite being told prose only. */
const MARKDOWN_NOISE = /^\s{0,3}(?:#{1,6}\s+|[-*+]\s+|\d+\.\s+)/gm
const BOLD_ITALIC = /\*{1,3}([^*]+)\*{1,3}/g

export function stripEvidenceIds(text: string): string {
  return text
    .replace(ID_IN_BRACKETS, '')
    .replace(BARE_ID, '')
    .replace(MARKDOWN_NOISE, '')
    .replace(BOLD_ITALIC, '$1')
    .replace(SPACE_BEFORE_PUNCT, '$1')
    .replace(RUN_OF_SPACES, ' ')
    .trim()
}
