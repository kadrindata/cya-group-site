# cyagroup.org

Website for the College & Young Adult Bible Study at BCEC Newton Campus, served by GitHub Pages.

## What's here

- `index.html` — the whole site: meeting info, the How (Not) to Read the Bible sessions, and the reading method.
- `materials/session-N/` — PDFs for each session (student handout, slides, leader guide).
- `CNAME` — tells GitHub Pages to serve the site at cyagroup.org. Don't delete it.
- `.nojekyll` — tells GitHub Pages to serve the files as they are.

## Common updates

**Skip a Sunday.** Near the bottom of `index.html`, add the date to the `SKIP` list:

```js
var SKIP = ["2026-12-20"];
```

The "Next meeting" date always shows the next 1st or 3rd Sunday that isn't on this list.

**Session dates.** Each session's date is worked out from `SERIES_START` (Session 1, Oct 4, 2026): every later session takes the next 1st or 3rd Sunday not in `SKIP`, so skipping a Sunday pushes the remaining sessions back one meeting. Past sessions are marked "Held", the next one "Next up", and the rest "Not yet held".

**Add a session's materials.** Put the PDFs in `materials/session-N/` using the same three file names, add the "not official / do not distribute" notice with `python3 tools/stamp_notice.py materials/session-N/*.pdf` (it skips any PDF that already has it), then in that session's entry in `index.html` replace the "Materials coming soon" line with a `mats` block like the one in Session 1, and remove `todo` from the session's `class`.

**Comments.** Each session has a comment section. Comments are stored in the "cyagroup.org Comments" Google Sheet (owned by ericwaikinchan@gmail.com) through a Google Apps Script web app; the script's source is in `comments/apps-script.gs`, and its web app URL is `COMMENTS_API` in `index.html`. To take a comment down, delete its row in the sheet or type anything in its Hide cell. Names are limited to 60 characters and comments to 1,500. If you change the script, redeploy it in Apps Script (Deploy → Manage deployments → Edit → New version) so the URL stays the same.

Changes go live a minute or two after they're pushed to the `main` branch.
