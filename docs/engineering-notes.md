# Session persistence that survives damaged records

The session reader previously trusted every syntactically valid JSON value. A partial write was skipped, but a valid JSON object with no timestamp could reach the timeline sorter and crash an otherwise usable session list. The summary also reported the number of displayed sessions as the total count.

The reader now validates the event shape with Zod, skips invalid records, and converts valid offset timestamps to UTC before sorting. The total is calculated before the recent-session preview is truncated. Extra fields remain compatible with future event writers.

Reproduce with `npm run verify`. The regression suite in `__tests__/session-store.test.ts` covers valid records around partial writes, primitive JSON and invalid timestamps, seven sessions with a two-item preview, and timestamps whose lexical order differs from their chronological order.

This is recovery during reads, not log repair: it does not delete records, rotate the log, or make multi-process writes transactional.

The lockfile also updates Browserslist to 4.28.9 and qs to 6.16.0 within the existing dependency ranges, resolving the advisories reported by CI. `npm audit --audit-level=low` reported zero vulnerabilities on 2026-09-07; the full verification command passed again after the update.
