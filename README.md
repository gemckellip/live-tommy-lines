# College Football Picks

A small browser app for tracking college football scores, betting lines, and personal picks.

## Run it

Extract this download into a new folder. On Windows, double-click `start-app.bat`. It opens the current app in your browser and serves this extracted folder on an available local port. Keep the command window open while using the app.

```bash
python3 start-app.py
```

The browser opens automatically. If the launcher reports that Python is missing, install Python and rerun it.

## Update GitHub Pages

Upload `index.html` from this download to the repository root, replace the existing `index.html`, and commit to main. The page contains its own game list, JavaScript, and styles. Wait for the Pages deployment to finish, then refresh the site with Ctrl+F5. The board should say “Week of Oct 10, 2026” and start with Florida State at Louisville.

`app.js` and `styles.css` are retained as editable sources. After editing them for a later week, run `python3 build-app.py` to rebuild the self-contained `index.html` before uploading it.

The app uses ESPN's public college-football scoreboard endpoint for live scores and ESPN's available odds record for the Vegas line. The selected date searches three days before and after, which accommodates a Friday/Saturday slate.

## Included slate

The 15 games from the supplied screenshot are preloaded. Picks are intentionally blank. The LSU–Kentucky game is marked as the weekly full-score tiebreaker and has fields for a predicted final score. Texas–Oklahoma is shown as a neutral-site game at the State Fair of Texas. The default date is October 10, 2026, and the score search covers three days before and after the selected date so the October 9–10 slate is included. Each week's picks and scoreboard date are saved separately.

Lines are entered as the Tommy line for the first-listed team. The app automatically displays the corresponding line for the second team, keeps ESPN's Vegas spread value, and shows that Vegas value using the away team—the same school shown for the Tommy line—while calculating live/final ATS status.
