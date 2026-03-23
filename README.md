# spudgunman.github.io

Personal landing site for **SpudGunMan**, hosted on GitHub Pages and used as a redirect target from the main dot-com domain.

## Site Structure

- `index.html` - Homepage and entry point
- `projects.html` - Live repository showcase pulled from GitHub API
- `about.html` - About and resume highlights
- `contact.html` - Contact and collaboration page
- `assets/css/site.css` - Shared visual style and responsive layout
- `assets/js/projects.js` - Repository fetching and filtering logic
- `assets/js/site.js` - Shared small UI behavior (copyright year)

## Notes

- The projects list fetches from `https://api.github.com/users/SpudGunMan/repos`.
