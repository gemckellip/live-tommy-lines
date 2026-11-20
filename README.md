# Live Tommy Lines — Week of November 21, 2026

The 15 games and Tommy lines from the supplied screenshot are preloaded in order. LSU at Tennessee is the full-score tiebreaker. The scoreboard date starts at November 21; the automatic score search also includes Central Michigan at Buffalo on November 18 and New Mexico at Wyoming on November 20.

## Update GitHub Pages

Extract this ZIP into a new folder. Upload its `index.html` to your repository root, replacing the old `index.html`, and commit to main. After the Pages deployment finishes, press Ctrl+F5. The page should say “Week of Nov 21, 2026” and begin with Central Michigan at Buffalo.

The page contains all its styles and game code, so uploading `index.html` is sufficient.

## Run locally

On Windows, double-click `start-app.bat`. It opens this extracted folder's app on an available local port. Keep the command window open while using the app. Python must be installed.

On other computers, run `python3 start-app.py`.

## Features

ESPN live scores refresh every 30 seconds. Tommy lines use the first-listed team's spread. The ESPN Vegas line displays that same team with ESPN's spread, and ATS results use the Tommy line. Kickoff times appear once in Eastern and Central time. Picks are saved in this browser separately for each weekly slate.

## Updating source files

`app.js` and `styles.css` are editable sources. After editing them, run `python3 build-app.py` to rebuild the self-contained `index.html` before uploading it.
