#!/usr/bin/env node
/** Prints the shape of the item bank — used in the science doc and the tests. */
import { ITEMS, SECTIONS, SCOREABLE_COUNT, ESTIMATED_MINUTES } from "../src/v2/engine/items/index.ts";
import { DIMENSIONS } from "../src/v2/engine/dimensions.ts";

console.log(`Total items: ${ITEMS.length} (scoreable ${SCOREABLE_COUNT}) · ~${ESTIMATED_MINUTES} min · ${SECTIONS.length} sections\n`);
for (const g of ["core", "modern", "context"]) {
  console.log(`— ${g.toUpperCase()} —`);
  for (const d of DIMENSIONS.filter((x) => x.group === g)) {
    const n = ITEMS.filter((i) => i.dimension === d.id && i.instructedValue === undefined).length;
    console.log(`  ${String(n).padStart(2)}  ${d.label}`);
  }
}
console.log("\nBy section:");
for (const s of SECTIONS) {
  console.log(`  ${String(ITEMS.filter((i) => i.section === s.id).length).padStart(2)}  ${s.title} (~${s.minutes} min)`);
}
