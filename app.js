const GAMES = [
  { id: "rutgers-boston-college", away: "Rutgers", home: "Boston College", spread: 5.5, network: "ESPN2" },
  { id: "missouri-kansas", away: "Missouri", home: "Kansas", spread: -4.5, network: "FOX" },
  { id: "arizona-state-texas-am", away: "Arizona State", home: "Texas A&M", spread: 16.5, network: "ABC" },
  { id: "oklahoma-michigan", away: "Oklahoma", home: "Michigan", spread: -9.5, network: "FOX" },
  { id: "wake-forest-purdue", away: "Wake Forest", home: "Purdue", spread: -3.5, network: "FS1" },
  { id: "alabama-kentucky", away: "Alabama", home: "Kentucky", spread: -13.5, network: "ABC" },
  { id: "arizona-byu", away: "Arizona", home: "BYU", spread: 8.5, network: "FOX" },
  { id: "ucf-pitt", away: "UCF", home: "Pitt", spread: 7.5, network: "ESPN2" },
  { id: "duke-illinois", away: "Duke", home: "Illinois", spread: 4.5, network: "FS1" },
  { id: "memphis-boise-state", away: "Memphis", home: "Boise State", spread: 6.5, network: "USA" },
  { id: "tennessee-georgia-tech", away: "Tennessee", home: "Georgia Tech", spread: -13.5, network: "ESPN" },
  { id: "ohio-state-texas", away: "Ohio State", home: "Texas", spread: 0, network: "ABC" },
  { id: "louisiana-tech-lsu", away: "Louisiana Tech", home: "LSU", spread: 39.5, network: "SEC Network", tiebreaker: true },
  { id: "iowa-state-iowa", away: "Iowa State", home: "Iowa", spread: 14.5, network: "NBC" },
  { id: "arkansas-utah", away: "Arkansas", home: "Utah", spread: 14.5, network: "ESPN" },
];

const STORAGE_KEY = "college-football-picks-week-2-2026-v1";
const DEFAULT_DATE = "2026-09-12";
const state = {
  scores: new Map(),
  picks: loadSavedPicks(),
  date: localStorage.getItem("college-football-date") || DEFAULT_DATE,
  refreshing: false,
};

const elements = {
  date: document.querySelector("#score-date"),
  autoRefresh: document.querySelector("#auto-refresh"),
  refresh: document.querySelector("#refresh-button"),
  gameList: document.querySelector("#game-list"),
  message: document.querySelector("#message"),
  picksEntered: document.querySelector("#picks-entered"),
  atsRecord: document.querySelector("#ats-record"),
  liveCount: document.querySelector("#live-count"),
  lastUpdated: document.querySelector("#last-updated"),
  heroGameCount: document.querySelector("#hero-game-count"),
};

elements.heroGameCount.textContent = GAMES.length;
elements.date.value = state.date;

function loadSavedPicks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function savePicks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.picks));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSpread(value) {
  if (value === 0) return "PK";
  return `${value > 0 ? "+" : ""}${value}`;
}

function formatVegasLine(game, details) {
  const raw = String(details || "").trim();
  if (!raw) return "Not posted yet";
  const spreadMatch = raw.match(/[+-]?\d+(?:\.\d+)?/);
  if (!spreadMatch) return raw;

  const spread = Number(spreadMatch[0]);
  if (teamMatches(game.away, raw) && !teamMatches(game.home, raw)) {
    return `${game.home} ${formatSpread(-spread)}`;
  }
  if (teamMatches(game.home, raw) && !teamMatches(game.away, raw)) {
    return `${game.home} ${formatSpread(spread)}`;
  }
  return raw;
}

function formatTime(value) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(value);
}

function formatGameDateTime(value) {
  if (!value) return "Time not posted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Kickoff time unavailable";
  const format = (timeZone, zone) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).formatToParts(date).filter(({ type }) => type !== "literal").map(({ type, value: part }) => [type, part]));
    const minutes = parts.minute === "00" ? "" : `:${parts.minute}`;
    return `${parts.month} ${parts.day} ${parts.hour}${minutes} ${zone}`;
  };
  return `${format("America/New_York", "ET")} / ${format("America/Chicago", "CT")}`;
}

function formatMargin(value) {
  const rounded = Math.round(Math.abs(value) * 2) / 2;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} pts`;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const aliases = {
  Miami: ["Miami Hurricanes", "Miami (FL)"],
  USC: ["Southern California", "USC Trojans"],
  Cal: ["California", "California Golden Bears"],
  "East Carolina": ["East Carolina Pirates"],
  "Boston College": ["Boston College Eagles"],
  "Ole Miss": ["Mississippi", "Ole Miss Rebels"],
  SMU: ["Southern Methodist", "SMU Mustangs"],
};

const seedTeamNames = [...new Set(GAMES.flatMap((game) => [game.away, game.home]))];

function teamMatches(expected, actual) {
  const actualName = normalize(actual);
  const candidates = [expected, ...(aliases[expected] || [])].map(normalize);
  return candidates.some((candidate) => {
    if (actualName === candidate) return true;
    const longerTeamPrefix = [...seedTeamNames, ...Object.values(aliases).flat()]
      .map(normalize)
      .some((other) => other !== candidate && other.startsWith(candidate) && actualName.startsWith(other));
    return !longerTeamPrefix && (actualName.includes(candidate) || candidate.includes(actualName));
  });
}

function findTeamIndex(expected, competitors) {
  return competitors.findIndex((item) => teamMatches(expected, item.team?.displayName || item.team?.shortDisplayName));
}

function gameLine(game) {
  return {
    away: formatSpread(game.spread),
    home: formatSpread(-game.spread),
  };
}

function getPick(game) {
  return state.picks[game.id] || { side: "none", awayScore: "", homeScore: "" };
}

function renderGames() {
  elements.gameList.innerHTML = GAMES.map((game) => renderGame(game)).join("");
  bindGameInputs();
  renderSummary();
}

function renderGame(game) {
  const pick = getPick(game);
  const score = state.scores.get(game.id);
  const lines = gameLine(game);
  const statusState = score?.state || "unknown";
  const statusClass = statusState === "in" ? "live" : statusState === "post" ? "final" : "upcoming";
  const statusText = statusState === "pre"
    ? "Upcoming"
    : score?.shortDetail || (statusState === "unknown" ? "No score found" : "Scheduled");
  const awayScore = score?.awayScore ?? "—";
  const homeScore = score?.homeScore ?? "—";
  const result = calculateResult(game, score, pick);
  const tiebreakerScore = game.tiebreaker ? renderTiebreaker(game, score, pick) : "";
  const kickoff = formatGameDateTime(score?.eventDate);
  const vegasLine = formatVegasLine(game, score?.vegasLine);

  return `
    <article class="game-card ${statusClass} ${game.tiebreaker ? "tiebreaker" : ""}" data-game-id="${game.id}">
      <div class="game-info">
        <div class="game-meta">
          <span class="network">${escapeHtml(game.network)}</span>
          ${game.neutral ? '<span class="network">• Neutral site</span>' : ""}
          ${game.tiebreaker ? '<span class="tiebreaker-label">Full-score tiebreaker</span>' : ""}
        </div>
        <div class="teams">
          <div class="team-row">
            <span class="team-name">${escapeHtml(game.away)}</span>
            <span class="team-role">${game.neutral ? "" : "Away"}</span>
            <strong class="team-score">${escapeHtml(awayScore)}</strong>
            <span class="team-line">${escapeHtml(lines.away)}</span>
          </div>
          <div class="team-row">
            <span class="team-name">${escapeHtml(game.home)}</span>
            <span class="team-role">${game.neutral ? "" : "Home"}</span>
            <strong class="team-score">${escapeHtml(homeScore)}</strong>
            <span class="team-line">${escapeHtml(lines.home)}</span>
          </div>
        </div>
      </div>
      <div class="game-status-panel">
        <div class="status-line"><i class="status-dot ${statusState === "in" ? "live-dot" : statusState === "post" ? "final-dot" : "upcoming-dot"}"></i>${escapeHtml(statusText)}</div>
        <div class="game-time status-time">${escapeHtml(kickoff)}</div>
        <div class="line-comparison">
          <div class="market-line"><span>Tommy line</span><strong>${escapeHtml(game.away)} ${escapeHtml(lines.away)}</strong></div>
          <div class="market-line"><span>Vegas line (ESPN)</span><strong>${escapeHtml(vegasLine)}</strong></div>
        </div>
        ${game.tiebreaker ? '<div class="status-detail tiebreaker-prompt">Enter the predicted final score below.</div>' : ""}
        ${score?.link ? `<a class="event-link" href="${escapeHtml(score.link)}" target="_blank" rel="noreferrer">Open ESPN game ↗</a>` : ""}
      </div>
      <div class="pick-panel">
        <label class="pick-label" for="pick-${game.id}">${game.tiebreaker ? "ATS pick (optional)" : "My pick"}</label>
        <select class="pick-select" id="pick-${game.id}" data-pick-id="${game.id}">
          <option value="none" ${pick.side === "none" ? "selected" : ""}>Select a team</option>
          <option value="away" ${pick.side === "away" ? "selected" : ""}>${escapeHtml(game.away)} (${escapeHtml(lines.away)})</option>
          <option value="home" ${pick.side === "home" ? "selected" : ""}>${escapeHtml(game.home)} (${escapeHtml(lines.home)})</option>
        </select>
        ${tiebreakerScore}
        <div class="pick-result">${result.html}</div>
      </div>
    </article>
  `;
}

function renderTiebreaker(game, score, pick) {
  const actual = score?.awayScore != null && score?.homeScore != null
    ? `<span class="actual-score">Actual: ${escapeHtml(score.awayScore)}–${escapeHtml(score.homeScore)}</span>`
    : "";
  return `
    <div class="tiebreaker-entry">
      <label class="score-input-wrap"><span>${escapeHtml(game.away)} score</span><input class="score-input" type="number" min="0" max="100" inputmode="numeric" placeholder="0" value="${escapeHtml(pick.awayScore)}" data-score-id="${game.id}" data-score-side="away" /></label>
      <label class="score-input-wrap"><span>${escapeHtml(game.home)} score</span><input class="score-input" type="number" min="0" max="100" inputmode="numeric" placeholder="0" value="${escapeHtml(pick.homeScore)}" data-score-id="${game.id}" data-score-side="home" /></label>
    </div>
    <div class="tiebreaker-note">Weekly tiebreaker: enter your predicted final score. ${actual}</div>
  `;
}

function calculateResult(game, score, pick) {
  if (pick.side === "none") return { html: '<span class="result-pill wait">Pick not set</span>' };
  if (!score || score.awayScore == null || score.homeScore == null || score.state === "pre") {
    return { html: '<span class="result-pill wait">Waiting for score</span>' };
  }
  const awayScore = Number(score.awayScore);
  const homeScore = Number(score.homeScore);
  const awayCoverMargin = awayScore + game.spread - homeScore;
  const coverMargin = pick.side === "away" ? awayCoverMargin : -awayCoverMargin;
  const isPush = coverMargin === 0;
  const isCover = coverMargin > 0;
  const live = score.state === "in";
  const label = isPush ? (live ? "Pushing" : "Push vs spread") : isCover ? (live ? "Covering" : "Win vs spread") : (live ? "Not covering" : "Loss vs spread");
  const klass = isPush ? "push" : isCover ? "cover" : "loss";
  const marginText = isPush ? "Even with the line" : `${isCover ? "Ahead" : "Behind"} by ${formatMargin(coverMargin)}`;
  return { html: `<span class="result-pill ${klass}">${label}</span><span class="result-margin">${marginText}</span>`, result: isPush ? "push" : isCover ? "win" : "loss" };
}

function bindGameInputs() {
  document.querySelectorAll("[data-pick-id]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const gameId = event.target.dataset.pickId;
      const current = getPick(GAMES.find((game) => game.id === gameId));
      state.picks[gameId] = { ...current, side: event.target.value };
      savePicks();
      renderGames();
    });
  });
  document.querySelectorAll("[data-score-id]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const gameId = event.target.dataset.scoreId;
      const side = event.target.dataset.scoreSide;
      const current = getPick(GAMES.find((game) => game.id === gameId));
      state.picks[gameId] = { ...current, [`${side}Score`]: event.target.value };
      savePicks();
      renderSummary();
    });
  });
}

function renderSummary() {
  const picks = GAMES.map(getPick);
  const entered = picks.filter((pick) => pick.side !== "none").length;
  const results = GAMES.map((game) => calculateResult(game, state.scores.get(game.id), getPick(game)).result).filter(Boolean);
  const wins = results.filter((result) => result === "win").length;
  const losses = results.filter((result) => result === "loss").length;
  const pushes = results.filter((result) => result === "push").length;
  const live = [...state.scores.values()].filter((score) => score.state === "in").length;
  elements.picksEntered.textContent = `${entered} / ${GAMES.length}`;
  elements.atsRecord.textContent = results.length ? `${wins}-${losses}${pushes ? `-${pushes}` : ""}` : "—";
  elements.liveCount.textContent = live;
}

function setMessage(message, error = false) {
  elements.message.textContent = message;
  elements.message.className = error ? "message error" : "message";
}

function dateParts(dateString, delta) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

async function fetchScoreboard(dateString) {
  const dates = [-3, -2, -1, 0, 1, 2, 3].map((delta) => dateParts(dateString, delta));
  const urls = dates.map((date) => `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?dates=${date}&groups=80&limit=500`);
  const responses = await Promise.all(urls.map((url) => fetch(url)));
  if (responses.some((response) => !response.ok)) throw new Error("The live score service returned an error.");
  const payloads = await Promise.all(responses.map((response) => response.json()));
  const events = payloads.flatMap((payload) => payload.events || []);
  const unique = new Map(events.map((event) => [event.id, event]));
  return GAMES.reduce((matches, game) => {
    const event = [...unique.values()].find((candidate) => {
      const competitors = candidate.competitions?.[0]?.competitors || [];
      const awayIndex = findTeamIndex(game.away, competitors);
      const homeIndex = findTeamIndex(game.home, competitors);
      return awayIndex >= 0 && homeIndex >= 0 && awayIndex !== homeIndex;
    });
    if (!event) return matches;
    const competition = event.competitions?.[0] || {};
    const competitors = competition.competitors || [];
    const away = competitors[findTeamIndex(game.away, competitors)];
    const home = competitors[findTeamIndex(game.home, competitors)];
    const type = event.status?.type || {};
    const odds = competition.odds?.[0] || {};
    matches.set(game.id, {
      state: type.state || "pre",
      shortDetail: type.shortDetail || type.detail || "Scheduled",
      awayScore: parseScore(away?.score),
      homeScore: parseScore(home?.score),
      link: event.links?.[0]?.href || "",
      eventDate: event.date,
      vegasLine: String(odds.details || "").trim(),
    });
    return matches;
  }, new Map());
}

function parseScore(score) {
  if (score == null || score === "") return null;
  const number = Number(score);
  return Number.isFinite(number) ? number : null;
}

async function refreshScores() {
  if (state.refreshing) return;
  state.refreshing = true;
  elements.refresh.disabled = true;
  setMessage("Refreshing scores…");
  try {
    state.scores = await fetchScoreboard(state.date);
    renderGames();
    const matched = state.scores.size;
    elements.lastUpdated.textContent = formatTime(new Date());
    setMessage(matched ? `Found ${matched} of ${GAMES.length} games around the selected date.` : "No matching games found around the selected date. Try changing the scoreboard date.");
  } catch (error) {
    setMessage(`${error.message} Check your connection and try again.`, true);
  } finally {
    state.refreshing = false;
    elements.refresh.disabled = false;
  }
}

elements.date.addEventListener("change", () => {
  state.date = elements.date.value || DEFAULT_DATE;
  localStorage.setItem("college-football-date", state.date);
  state.scores = new Map();
  renderGames();
  refreshScores();
});
elements.refresh.addEventListener("click", refreshScores);
setInterval(() => {
  if (elements.autoRefresh.checked) refreshScores();
}, 30000);

renderGames();
refreshScores();
