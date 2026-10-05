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

**Add a session's materials.** Put the PDFs in `materials/session-N/` using the same three file names, then in that session's entry in `index.html` replace the "Materials coming soon" line with a `mats` block like the one in Session 1, and remove `todo` from the session's `class`.

Changes go live a minute or two after they're pushed to the `main` branch.
