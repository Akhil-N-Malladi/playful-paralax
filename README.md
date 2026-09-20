# Akhil — portfolio studio

Open `index.html` in a modern browser, or serve this folder:

```sh
python -m http.server 8000
```

Then visit http://localhost:8000. No build step, package install, or API key is required. Deploy the contents of this folder to your existing static website host.

## Design and interactions

- Warm ivory, sage, and terracotta theme, with coordinated dark mode.
- Shaded 3D torus rendered from geometry on a canvas, with a pause control.
- Featured Congressional App Challenge weather project linking to the supplied URL.
- Rotatable 3D gradient descent demonstration with adjustable learning rate, run/pause, single step, reset, and live loss values.
- Existing books, probability puzzle, competition timeline, Markov model, Monte Carlo demo, and portfolio content retained.
- Responsive layouts, keyboard controls, reduced-motion support, and offscreen animation pausing.

The gradient descent example minimizes f(x,y) = 0.5x² + 1.5y² with gradient (x,3y). It is an educational demo, not an implementation of the weather project's model. The weather illustration is decorative, not a screenshot or live forecast. The supplied weather project URL was unavailable during editing; its unverified technical details were not added. Existing achievement claims are carried forward from the supplied source.

`studio.css` and `studio.js` contain the redesign. The former `parallax.css` and `parallax.js` are retained as reference but no longer loaded: large background overlays were replaced with focused visual interactions. External book cover images still require an internet connection and retain the existing fallback behavior.
