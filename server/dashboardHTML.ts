// ============================================================
// DASHBOARD HTML — Generates the evaluation dashboard page
// ============================================================

import { TestResult } from "./testLogger";

export function generateDashboardHTML(results: TestResult[]): string {
  const totalRuns = results.length;
  const totalNames = results.reduce((sum, r) => sum + r.totalNames, 0);
  const ratedNames = results.reduce(
    (sum, r) => sum + r.names.filter((n) => n.rating).length,
    0,
  );
  const goodNames = results.reduce(
    (sum, r) => sum + r.names.filter((n) => n.rating === "good").length,
    0,
  );
  const maybeNames = results.reduce(
    (sum, r) => sum + r.names.filter((n) => n.rating === "maybe").length,
    0,
  );
  const badNames = results.reduce(
    (sum, r) => sum + r.names.filter((n) => n.rating === "bad").length,
    0,
  );
  const ratedScore =
    ratedNames > 0
      ? Math.round(((goodNames + maybeNames * 0.5) / ratedNames) * 100)
      : 0;

  // Profile breakdown
  const profileStats: Record<
    string,
    { count: number; good: number; bad: number; maybe: number; rated: number; names: string[] }
  > = {};
  for (const r of results) {
    const key = r.profileLabel || "Manual / Custom";
    if (!profileStats[key])
      profileStats[key] = { count: 0, good: 0, bad: 0, maybe: 0, rated: 0, names: [] };
    profileStats[key].count++;
    profileStats[key].good += r.names.filter((n) => n.rating === "good").length;
    profileStats[key].bad += r.names.filter((n) => n.rating === "bad").length;
    profileStats[key].maybe += r.names.filter((n) => n.rating === "maybe").length;
    profileStats[key].rated += r.names.filter((n) => n.rating).length;
    profileStats[key].names.push(
      ...r.names.filter((n) => n.rating === "good").map((n) => n.name),
    );
  }

  const profileRows = Object.entries(profileStats)
    .map(([label, stats]) => {
      const score =
        stats.rated > 0
          ? Math.round(((stats.good + stats.maybe * 0.5) / stats.rated) * 100)
          : null;
      const goodNamesList =
        stats.names.length > 0
          ? stats.names.slice(0, 10).join(", ") +
            (stats.names.length > 10 ? "..." : "")
          : "";
      return `
        <tr>
          <td>${label}</td>
          <td>${stats.count}</td>
          <td>${stats.rated}</td>
          <td>${stats.good}</td>
          <td>${stats.bad}</td>
          <td class="score-cell ${score !== null && score < 50 ? "warn" : ""}">${
            score === null ? "—" : score + "%"
          }</td>
          <td class="good-list">${goodNamesList}</td>
        </tr>`;
    })
    .join("\n");

  const resultCards = results
    .map((r) => {
      const time = new Date(r.timestamp).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      });
      const heritageStr = r.heritage.length > 0 ? r.heritage.join(", ") : "—";
      const vibesStr = r.vibes.length > 0 ? r.vibes.join(", ") : "—";
      const lovedStr = r.namesYouLove.length > 0 ? r.namesYouLove.join(", ") : "—";
      const rated = r.names.filter((n) => n.rating).length;
      const good = r.names.filter((n) => n.rating === "good").length;
      const bad = r.names.filter((n) => n.rating === "bad").length;
      const score = r.avgRating !== undefined ? `${r.avgRating}%` : "—";

      const nameCards = r.names
        .map((n, i) => {
          const ratingClass = n.rating ? `rated rated-${n.rating}` : "";
          const escapedWhy = (n.why || "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
          const escapedMeaning = (n.meaning || "").replace(/</g, "&lt;");
          return `
          <div class="name-card ${ratingClass}" id="${r.id}-${i}">
            <div class="name-name">${n.name}</div>
            ${n.meaning ? `<div class="name-meaning">${escapedMeaning}</div>` : ""}
            ${n.why ? `<div class="name-why">${escapedWhy}</div>` : ""}
            ${n.origin ? `<div class="name-origin">${n.origin}</div>` : ""}
            <div class="rate-buttons">
              <button onclick="rateName('${r.id}', ${i}, 'good')" class="rate-btn ${
                n.rating === "good" ? "active-good" : ""
              }">👍 Good</button>
              <button onclick="rateName('${r.id}', ${i}, 'maybe')" class="rate-btn ${
                n.rating === "maybe" ? "active-maybe" : ""
              }">🤔 Maybe</button>
              <button onclick="rateName('${r.id}', ${i}, 'bad')" class="rate-btn ${
                n.rating === "bad" ? "active-bad" : ""
              }">👎 Bad</button>
            </div>
          </div>`;
        })
        .join("\n");

      const escapedBatchNotes = (r.batchNotes || "").replace(/</g, "&lt;");

      return `
        <div class="result-card">
          <div class="result-header">
            <div>
              <span class="result-profile">${r.profileLabel}</span>
              <span class="result-time">${time}</span>
            </div>
            <div class="result-actions">
              <span class="result-score" title="Quality score">${score}</span>
              <button onclick="deleteResult('${r.id}')" class="delete-btn">Delete</button>
            </div>
          </div>
          <div class="result-meta">
            <div class="meta-row"><span class="meta-label">Sex:</span> ${r.babySex}</div>
            <div class="meta-row"><span class="meta-label">Surname:</span> ${r.surname || "—"}</div>
            <div class="meta-row"><span class="meta-label">Heritage:</span> ${heritageStr}</div>
            <div class="meta-row"><span class="meta-label">Faith:</span> ${r.faith}</div>
            <div class="meta-row"><span class="meta-label">Vibes:</span> ${vibesStr}</div>
            <div class="meta-row"><span class="meta-label">Uniqueness:</span> ${r.uniqueness}/5</div>
            <div class="meta-row"><span class="meta-label">Loved names:</span> ${lovedStr}</div>
            <div class="meta-row"><span class="meta-label">Model:</span> ${r.model}</div>
            <div class="meta-row"><span class="meta-label">Generated:</span> ${r.totalNames} names</div>
            <div class="meta-row"><span class="meta-label">Rated:</span> ${rated} (${good} 👍, ${bad} 👎)</div>
          </div>
          <div class="names-grid">
            ${nameCards}
          </div>
          <div class="batch-notes-section">
            <textarea class="batch-notes" placeholder="Notes on this batch of names..." id="notes-${r.id}" onchange="saveNotes('${r.id}')">${escapedBatchNotes}</textarea>
          </div>
        </div>`;
    })
    .join("\n");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NameNest - Test Evaluation Dashboard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f3f0; color: #2a2a2a; padding: 20px; max-width: 1400px; margin: 0 auto; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .subtitle { color: #888; font-size: 14px; margin-bottom: 24px; }
  .stats-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
  .stat-box { background: white; border-radius: 12px; padding: 16px 20px; min-width: 130px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .stat-num { font-size: 28px; font-weight: 700; }
  .stat-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-box.score .stat-num { color: ${ratedScore >= 60 ? "#2e7d32" : ratedScore >= 40 ? "#e65100" : "#c62828"}; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  th { background: #e8e2d8; padding: 12px 16px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #555; }
  td { padding: 12px 16px; border-top: 1px solid #eee; font-size: 14px; }
  .score-cell { font-weight: 700; }
  .score-cell.warn { color: #c62828; }
  .good-list { color: #888; font-size: 13px; }

  .result-card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
  .result-profile { font-size: 18px; font-weight: 700; }
  .result-time { font-size: 13px; color: #aaa; margin-left: 12px; }
  .result-actions { display: flex; align-items: center; gap: 12px; }
  .result-score { font-size: 20px; font-weight: 700; color: #2e7d32; }
  .delete-btn { background: #fff0f0; color: #c62828; border: 1px solid #ffcdd2; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-size: 13px; }
  .delete-btn:hover { background: #ffebee; }

  .result-meta { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 6px 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
  .meta-row { font-size: 13px; }
  .meta-label { color: #aaa; font-weight: 600; }

  .names-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
  .name-card { background: #faf8f5; border: 1px solid #eee; border-radius: 10px; padding: 14px; transition: border-color 0.2s; }
  .name-card.rated-good { border-color: #a5d6a7; background: #f1f8f3; }
  .name-card.rated-maybe { border-color: #ffe082; background: #fffde7; }
  .name-card.rated-bad { border-color: #ef9a9a; background: #fff5f5; }
  .name-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .name-meaning { font-size: 13px; color: #666; font-style: italic; }
  .name-why { font-size: 12px; color: #888; margin-top: 4px; }
  .name-origin { font-size: 11px; color: #aaa; margin-top: 2px; }
  .rate-buttons { display: flex; gap: 6px; margin-top: 10px; }
  .rate-btn { font-size: 12px; padding: 4px 10px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; background: white; transition: all 0.15s; }
  .rate-btn:hover { border-color: #bbb; }
  .rate-btn.active-good { background: #c8e6c9; border-color: #4caf50; }
  .rate-btn.active-maybe { background: #fff9c4; border-color: #fbc02d; }
  .rate-btn.active-bad { background: #ffcdd2; border-color: #e53935; }

  .batch-notes-section { margin-top: 16px; }
  .batch-notes { width: 100%; min-height: 60px; border: 1px solid #eee; border-radius: 8px; padding: 10px; font-size: 13px; font-family: inherit; resize: vertical; background: #fafafa; }

  .empty-state { text-align: center; padding: 60px; color: #aaa; }
  a.refresh { color: #1976d2; text-decoration: none; font-size: 13px; }
</style>
</head>
<body>
  <h1>🐣 NameNest Test Dashboard</h1>
  <p class="subtitle">Evaluate name generation quality across test profiles. <a href="#" class="refresh" onclick="location.reload(); return false;">Refresh</a></p>

  <div class="stats-bar">
    <div class="stat-box"><div class="stat-num">${totalRuns}</div><div class="stat-label">Test Runs</div></div>
    <div class="stat-box"><div class="stat-num">${totalNames}</div><div class="stat-label">Names Generated</div></div>
    <div class="stat-box"><div class="stat-num">${ratedNames}</div><div class="stat-label">Names Rated</div></div>
    <div class="stat-box"><div class="stat-num">${goodNames}</div><div class="stat-label">👍 Good</div></div>
    <div class="stat-box"><div class="stat-num">${maybeNames}</div><div class="stat-label">🤔 Maybe</div></div>
    <div class="stat-box"><div class="stat-num">${badNames}</div><div class="stat-label">👎 Bad</div></div>
    <div class="stat-box score"><div class="stat-num">${ratedNames > 0 ? ratedScore + "%" : "—"}</div><div class="stat-label">Quality Score</div></div>
  </div>

  ${
    totalRuns > 0 && Object.keys(profileStats).length > 0
      ? `
  <table>
    <thead>
      <tr><th>Profile</th><th>Runs</th><th>Rated</th><th>👍</th><th>👎</th><th>Score</th><th>Top Rated Names</th></tr>
    </thead>
    <tbody>${profileRows}</tbody>
  </table>`
      : ""
  }

  <div id="results">
    ${
      totalRuns > 0
        ? resultCards
        : '<div class="empty-state"><p style="font-size: 20px;">No test results yet.</p><p style="margin-top: 8px;">Run a test with a quick-fill profile in the app to see results here.</p></div>'
    }
  </div>

  <script>
    async function rateName(resultId, nameIndex, rating) {
      await fetch('/api/test-results/' + resultId + '/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameIndex, rating }),
      });
      location.reload();
    }
    async function saveNotes(resultId) {
      const notes = document.getElementById('notes-' + resultId).value;
      await fetch('/api/test-results/' + resultId + '/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    }
    async function deleteResult(resultId) {
      if (!confirm('Delete this test run?')) return;
      await fetch('/api/test-results/' + resultId, { method: 'DELETE' });
      location.reload();
    }
  </script>
</body>
</html>
  `;
}
