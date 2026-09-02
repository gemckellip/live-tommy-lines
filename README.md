# College Football Picks

A small browser app for tracking college football scores, betting lines, and personal picks.

## Run it

No build step or package installation is required. Because live score requests are made from the browser, run a small local web server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. On Windows, you can also double-click `start-app.bat`.

Keep the black command window open while using the app. If the launcher reports that Python is missing, install Python and rerun it. If it reports that port 8000 is already in use, close the other local server or run `python -m http.server 8001` and open `http://localhost:8001` instead.

The app uses ESPN's public college-football scoreboard endpoint for live scores. The selected date searches one day before, the selected day, and one day after, which accommodates a Friday/Saturday slate.

## Included slate

The 15 games from the supplied screenshot are preloaded. Picks are intentionally blank. The Clemson–LSU game is marked as the weekly full-score tiebreaker and has fields for a predicted final score. The default date is September 5, 2026, and the score search covers three days before and after the selected date so the full September 3–7 slate is included.

Lines are entered as the spread for the first-listed team. The app automatically displays the corresponding line for the second team and calculates live/final ATS status.
