/**
 * The mark: a hand mirror.
 *
 * Drawn as vector rather than shipped as a raster, so it stays crisp at 16px in a browser tab and
 * at 64px in the header, costs about a kilobyte, and takes its colours from the same tokens as
 * everything else — sindoor for the frame, a warm cream glow for the glass.
 *
 * The two gaps at the frame's waist are the whole idea: the mirror is open at the sides, so what
 * you see in it is not sealed off from you. That, and आईना means mirror.
 */
export function Logo({
  size = 30,
  title,
}: {
  size?: number | string
  /** Give a title when the mark stands alone as a link; omit when text beside it already names it. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <radialGradient id="aaina-glass" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="#FFFCF6" />
          <stop offset="62%" stopColor="#FDF3E4" />
          <stop offset="100%" stopColor="#F7E9D6" />
        </radialGradient>
      </defs>

      {/* the glass */}
      <ellipse cx="32" cy="22" rx="15.2" ry="20.2" fill="url(#aaina-glass)" />

      <g
        fill="none"
        stroke="var(--color-sindoor, #A6362A)"
        strokeWidth="4.4"
        strokeLinecap="round"
      >
        {/* frame, upper half — open at the waist on both sides */}
        <path d="M 16 20.4 A 16 21 0 0 1 32 1.4 A 16 21 0 0 1 48 20.4" />
        {/* frame, lower half, closing to a point where the handle begins */}
        <path d="M 48 23.6 A 16 21 0 0 1 32 43 A 16 21 0 0 1 16 23.6" />
        {/* the handle */}
        <path d="M 32 43 V 60" strokeWidth="4.6" />
      </g>
    </svg>
  )
}
