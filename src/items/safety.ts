import type { Item } from '../engine/types'

/**
 * Safety items — universal, ambient, never triggered.
 *
 * This file implements CUES (Miller et al. 2015): Confidentiality, Universal Education, Support.
 * Everyone is asked; everyone is given the information; **disclosure is explicitly not the goal.**
 * Because the questions are universal, an answer here can never single anyone out, and support
 * information can never read as a reaction to something someone admitted.
 *
 * The founder's instruction was: do not hand people a phone number instead of help. The evidence
 * agrees — that pattern is called screen-and-refer and it is documented as failing, with clinicians
 * describing it as the tool "hanging up on them". So:
 *
 *   LAW 5 — a safety flag may only ever ADD. There is no code path in Aaina where any answer below
 *   truncates the report, blocks a route, gates continuation, or swaps analysis for a resource
 *   panel. `safety.test.ts` asserts this by comparing section and evidence counts with the flag
 *   set and unset.
 *
 * Every answer here lives in `safetyStore`, which has no persist middleware by construction. These
 * answers never reach localStorage, never enter a share link, and are excluded from print unless
 * the user explicitly asks for them.
 *
 * Risk items are drawn from the constructs in the India-adapted Danger Assessment (Sabri et al.
 * 2024) rather than an imported instrument — in-law involvement, food deprivation and violence
 * during pregnancy carried the largest risk ratios in the Indian validation and appear in no
 * Western scale.
 */

const s = (
  id: string,
  text: string,
  sources: string[],
  format: Item['format'] = 'likert5',
): Item => ({
  id,
  text,
  format,
  dimension: null,
  reverse: false,
  sources,
  licence: 'aaina-authored',
  chapter: 'safety',
  safety: true,
})

export const SAFETY_ITEMS: Item[] = [
  /* ── the universal frame, shown to everyone before the questions ── */

  /* physical */
  s('saf_phys', 'Has a partner ever pushed, slapped, grabbed, thrown something at, or otherwise physically hurt you?', ['who2013', 'sabri2024']),
  s('saf_escalate', 'Has that become more frequent or more serious over time?', ['campbell2003', 'sabri2024']),
  s('saf_threat', 'Have you been threatened — with harm to you, to someone you love, or to yourself?', ['campbell2003']),
  s('saf_pregnancy', 'Has this happened while you were pregnant?', ['sabri2024']),

  /* coercive control — a liberty issue, and the absence of violence never downgrades it */
  s('saf_monitor', 'Does someone check your phone, your messages, or where you are, in a way you have not agreed to?', ['stark2007']),
  s('saf_isolate', 'Have you become more cut off from friends or family since this relationship began?', ['stark2007', 'sabri2024']),
  s('saf_money', 'Is your access to money, work, study, or leaving the house controlled by someone else?', ['stark2007', 'sabri2024']),
  s('saf_food', 'Have you been denied food, sleep, or medical care?', ['sabri2024']),
  s('saf_inlaws', 'Do in-laws or other family members take part in, or back, how you are being treated?', ['sabri2024']),
  s('saf_blame', 'Are you told that what happens is your fault?', ['stark2007', 'who2013']),
  s('saf_consent', 'Have you been made to do something physical you did not want to do?', ['who2013']),

  /* self-directed risk — asking does not cause harm (Dazzi et al. 2014), so we ask plainly */
  s('saf_self_1', 'In the last two weeks, have you had thoughts that you would be better off not here?', ['dazzi2014']),
  s('saf_self_2', 'Have you thought about acting on that?', ['dazzi2014']),

  /* the user's own use of violence — served, never colluded with, never given the mutuality frame */
  s('saf_perp', 'Have you yourself hurt, frightened, or physically restrained a partner?', ['stark2007', 'who2013']),

  /* the one free-text, because a number never captured anybody's situation */
  {
    id: 'saf_text',
    text: 'If any of that is part of your story and you want the analysis to take it into account, tell it however you want to.',
    format: 'freetext',
    dimension: null,
    reverse: false,
    sources: ['who2013', 'cues'],
    licence: 'aaina-authored',
    chapter: 'safety',
    safety: true,
    placeholder: 'Only if you want to. Skipping this changes nothing about what you get.',
  },
]

/**
 * The words shown above the safety questions — to every user, every time.
 * Universal education means the framing is identical whether or not anyone discloses anything.
 */
export const SAFETY_PREAMBLE = {
  title: 'These questions go to everyone',
  body:
    'Not because of anything you have said so far — everyone who uses Aaina sees this page. ' +
    'Some of it will not apply to you, and that is the normal outcome. We ask because a lot of ' +
    'what makes a relationship hard to think about clearly is the part people do not have words ' +
    'for yet.',
  privacy:
    'Your answers on this page stay in this browser\'s memory only. They are not saved, not ' +
    'included in a shared link, and not printed unless you ask for them. Closing this tab erases ' +
    'them completely.',
  optOut: 'You can skip every question here and the rest of your report is unchanged.',
}

/**
 * Support information. LAW 5 in its clearest form: this is rendered for EVERY user from the first
 * screen, in the footer, regardless of what anyone answers. It is never surfaced *in response to*
 * a disclosure, because a resource that appears the moment you admit something is a door closing,
 * not a door opening.
 */
export const AMBIENT_SUPPORT = {
  label: 'If you ever want to talk to a person',
  lines: [
    { name: 'Tele-MANAS', detail: '14416 — the Government of India mental-health line, free, 24×7, in most Indian languages.' },
    { name: 'Women Helpline', detail: '181 — national, 24×7.' },
    { name: 'Emergency', detail: '112.' },
  ],
  honesty:
    'We list these because you should know they exist, not instead of doing our job. ' +
    'Everything Aaina does for anyone else, it does for you too.',
}
