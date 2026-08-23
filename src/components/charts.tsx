/** Bespoke report visuals — dataviz-skill discipline:
 *  single-hue marks (ink fill, sindoor markers), identity by position + direct
 *  labels (never by the sindoor/brass pair — validator failed it, ΔE 5.0 deutan),
 *  thin marks, recessive tracks, prints as-is. */

export function ScaleMeter({
  label,
  hint,
  value,
  min,
  max,
  cutoff,
  cutoffLabel,
  valueText,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  cutoff?: number;
  cutoffLabel?: string;
  valueText: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const cutoffPct = cutoff !== undefined ? ((cutoff - min) / (max - min)) * 100 : null;
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-sm tabular-nums text-ink-soft">{valueText}</p>
      </div>
      <div className="relative mt-2 h-2 w-full rounded-full bg-paper-edge">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ink-soft"
          style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
        />
        {cutoffPct !== null && (
          <span
            aria-hidden
            className="absolute -top-1 h-4 w-0.5 bg-sindoor"
            style={{ left: `${cutoffPct}%` }}
            title={cutoffLabel}
          />
        )}
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
        {hint}
        {cutoff !== undefined && cutoffLabel ? ` · लाल nishaan: ${cutoffLabel}` : ""}
      </p>
    </div>
  );
}

export function Palda({
  stay,
  leave,
}: {
  stay: number; // 1–7
  leave: number; // 1–7
}) {
  const pct = (v: number) => ((v - 1) / 6) * 100;
  return (
    <div className="py-3">
      <div className="space-y-3">
        {[
          { label: "Rehne ke palde", value: stay },
          { label: "Jaane ke palde", value: leave },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-ink">{row.label}</p>
              <p className="text-sm tabular-nums text-ink-soft">{row.value.toFixed(1)} / 7</p>
            </div>
            <div className="relative mt-1.5 h-2 w-full rounded-full bg-paper-edge">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-ink-soft"
                style={{ width: `${Math.max(2, pct(row.value))}%` }}
              />
              <span
                aria-hidden
                className="absolute -top-1 h-4 w-0.5 bg-sindoor"
                style={{ left: "50%" }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
        Laal nishaan beech ka point hai — dono palde usse upar hon, toh use
        ambivalence kehte hain (Joel et al., 2018). Yeh galti nahi, sacchai hai.
      </p>
    </div>
  );
}
