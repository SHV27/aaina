import { BANDS, DIMENSION_BY_ID, bandFor } from "../engine/dimensions";
import type { DimensionScore } from "../engine/types";

/** Score presentation. Single-hue marks, position and label carry identity —
 *  never colour alone. Prints as-is. */

export function OverallDial({ value }: { value: number }) {
  const band = bandFor(value);
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-6xl font-light tabular-nums text-ink sm:text-7xl">
          {Math.round(value)}
        </span>
        <span className="text-lg text-ink-3">/ 100</span>
      </div>
      <p className="mt-1 text-sm font-medium uppercase tracking-widest text-brass-deep">
        {band.label}
      </p>
      <div className="relative mt-4 h-2 w-full max-w-md rounded-full bg-paper-3">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-ink-2"
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
        {BANDS.slice(1).map((b) => (
          <span
            key={b.id}
            aria-hidden
            className="absolute -top-1 h-4 w-px bg-line"
            style={{ left: `${b.min}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex w-full max-w-md justify-between text-[11px] text-ink-3">
        {BANDS.map((b) => (
          <span key={b.id}>{b.min}</span>
        ))}
        <span>100</span>
      </div>
    </div>
  );
}

export function DimensionBar({
  score,
  showLabels = true,
}: {
  score: DimensionScore;
  showLabels?: boolean;
}) {
  const dim = DIMENSION_BY_ID.get(score.dimension);
  if (!dim) return null;
  const band = bandFor(score.normalized);
  const unanswered = score.answered === 0;

  return (
    <div className="py-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-ink">{dim.label}</p>
        <p className="text-sm tabular-nums text-ink-2">
          {unanswered ? "—" : `${Math.round(score.normalized)}`}
          <span className="text-ink-3"> / 100</span>
        </p>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-paper-3">
        {!unanswered && (
          <div
            className="h-full rounded-full bg-ink-2"
            style={{ width: `${Math.max(2, score.normalized)}%` }}
          />
        )}
      </div>
      {showLabels && (
        <div className="mt-1 flex justify-between text-[11px] text-ink-3">
          <span>{dim.lowLabel}</span>
          <span className="font-medium text-brass-deep">{unanswered ? "not answered" : band.label}</span>
          <span>{dim.highLabel}</span>
        </div>
      )}
    </div>
  );
}

export function ComponentTable({
  components,
}: {
  components: { dimension: string; normalized: number; weight: number }[];
}) {
  const total = components.reduce((a, c) => a + c.weight, 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[26rem] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink-3">
            <th className="py-2 font-medium">Dimension</th>
            <th className="py-2 text-right font-medium">Score</th>
            <th className="py-2 text-right font-medium">Weight</th>
            <th className="py-2 text-right font-medium">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.dimension} className="border-b border-line/60">
              <td className="py-2 text-ink-2">
                {DIMENSION_BY_ID.get(c.dimension as never)?.label ?? c.dimension}
              </td>
              <td className="py-2 text-right tabular-nums text-ink">
                {Math.round(c.normalized)}
              </td>
              <td className="py-2 text-right tabular-nums text-ink-3">
                {((c.weight / total) * 100).toFixed(1)}%
              </td>
              <td className="py-2 text-right tabular-nums text-ink-2">
                {((c.normalized * c.weight) / total).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
