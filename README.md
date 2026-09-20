# Akhil - connected portfolio

Open `index.html` directly, or serve this folder with `python -m http.server 8000`. Upload the folder contents to your existing static host. No build step is required.

This version removes the rotating hero graphic and uses a quieter card system with flat surfaces. It keeps the scroll-driven math, terminal, and market backgrounds, with extra blur in the finance section.

The journey section now uses a 23-milestone radial graph. Earlier milestones sit near the center, later milestones branch outward, and category colors replace column grouping. Nodes respond to pointer movement, support dragging, trace connected paths with a glowing traveler, and reveal a button that jumps to the related page section. AMC 12 and AIME both connect directly to Stanford SUMaC.

The lost boarding pass interaction now matches the problem shown on the page. Its explanation stays hidden until the user reveals the result. The Congressional App Challenge card requests a live screenshot and falls back to a local preview if the screenshot service fails.

Dark mode and reduced-motion support remain. USAMO is marked as a future goal.

## SEO and crawler setup

The package now includes `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest`, a crawlable favicon, a social preview image, canonical/Open Graph/Twitter metadata, and JSON-LD `WebSite` + `ProfilePage` + `Person` structured data. The canonical URL is currently `https://akhil-malladi-paralax-portfolio.onrender.com/`. If the production domain changes, update that URL in `index.html`, `robots.txt`, `sitemap.xml`, and `llms.txt` before deployment.

After deployment, submit `https://akhil-malladi-paralax-portfolio.onrender.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools, then request indexing for the home page. Validate the deployed page with Google Rich Results Test and URL Inspection.
The Journey section uses a radial network that expands to a full-screen focus view on interaction, keeps every milestone visible without overlap, and retains the legend and milestone descriptor on the left.
