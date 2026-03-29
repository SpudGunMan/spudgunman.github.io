# spudgunman.github.io

Personal landing site for **SpudGunMan**, hosted on GitHub Pages and used as a redirect target from the main dot-com domain.

## Site Structure

- `index.html` - Homepage and entry point
- `projects.html` - Live repository showcase pulled from GitHub API
- `blog.html` - Story list pulled from files in `blog/` with subject filters
- `about.html` - About and resume highlights
- `contact.html` - Contact and collaboration page
- `assets/css/site.css` - Shared visual style and responsive layout
- `assets/js/projects.js` - Repository fetching and filtering logic
- `assets/js/blog.js` - Blog file loading, front-matter parsing, and subject filtering
- `assets/js/site.js` - Shared small UI behavior (copyright year)

## Notes

- The projects list fetches from `https://api.github.com/users/SpudGunMan/repos`.
- The blog list fetches from `https://api.github.com/repos/SpudGunMan/spudgunman.github.io/contents/blog`.
- Blog files support lightweight front matter:

	```
	---
	title: Example title
	date: 2026-03-28
	subjects: nerd-stuff, life
	summary: Optional summary text.
	---
	```
