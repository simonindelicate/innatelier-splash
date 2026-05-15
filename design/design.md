# Innatelier Splash Page Build Notes

Build a single-page static splash site in plain HTML and CSS.

## Hard requirements

Use only:

- `index.html`
- `css/style.css`
- assets from `/assets`

Do not use:

- React
- Vue
- Svelte
- Vite
- Tailwind
- Bootstrap
- npm
- build tools
- package managers
- preprocessors
- JSX
- TypeScript
- external libraries
- CDN dependencies

The finished site must work by opening `index.html` directly in a browser.

## Design references

Use these exported Figma reference images:

- `design/desktop-reference.png`
- `design/mobile-reference.png`

Use these exported background images:

- `assets/bg-desktop.jpg`
- `assets/bg-mobile.jpg`

The implementation should match the reference images closely.

## Page content

### Main title

```text
innatelier
```

### Strapline

```text
ENDURING BEAUTY STARTS WITHIN
```

### Body copy

```text
Innatelier™ is where beauty and wellness meet biological agency. Where women can close the gap between their biology and their ambition.

Something exciting is in the works. Join our Substack community to be part of the journey from the very start.
```

### Button text

```text
JOIN THE COMMUNITY
```

The button href can be `#` for now.

## Layout

The page is a single full-screen splash page.

Desktop:

- Use `assets/bg-desktop.jpg` as the full-viewport background.
- Background should cover the viewport without tiling.
- Content is centred horizontally.
- Content is vertically centred, or very slightly above centre if needed to match the reference.
- Text block should be narrow and centred.
- Logo/title should be large, pale, widely letter-spaced.
- Strapline should sit below the title with strong letter spacing.
- Body copy should sit below the strapline.
- Button should sit below the body copy.

Mobile:

- Use `assets/bg-mobile.jpg` as the full-viewport background.
- Switch to the mobile background below `700px` viewport width.
- Content remains centred.
- Scale typography down to match `design/mobile-reference.png`.
- Maintain the same visual hierarchy as desktop.
- Avoid duplicated HTML for mobile.

## Typography

Approximate the Figma design with system fonts unless exact fonts have been exported.

Suggested approach:

- Main title: serif font, very wide letter spacing.
- Strapline: sans-serif, uppercase, wide letter spacing.
- Body copy: sans-serif, small, light-weight appearance.
- Button: sans-serif, uppercase, bold, small, wide letter spacing.

Use CSS `letter-spacing` and `text-indent` together where needed so centred text remains optically centred.

## Colour and visual treatment

Overall palette:

- black
- deep red
- dark burgundy
- pale cyan/white text
- pale cyan button

Text:

- Main title: very pale cyan or near-white.
- Strapline: pale cyan/white with reduced opacity.
- Body copy: pale cyan/white with reduced opacity.
- Use subtle text-shadow only if needed for legibility.

Button:

- Small pill shape.
- Pale cyan background.
- Dark text.
- No heavy border.
- Slight hover/focus change is acceptable, but keep it restrained.

## Responsive behaviour

Use CSS media queries only.

Suggested breakpoint:

```css
@media (max-width: 700px) {
  /* mobile styles */
}
```

The page should not scroll on normal desktop or mobile viewports unless the viewport is unusually short.

Use:

```css
min-height: 100vh;
```

or preferably:

```css
min-height: 100svh;
```

with a `100vh` fallback if appropriate.

## Accessibility and HTML structure

Use semantic HTML.

Suggested structure:

```html
<main class="splash">
  <section class="splash__content" aria-labelledby="site-title">
    <h1 id="site-title">innatelier</h1>
    <p class="strapline">ENDURING BEAUTY STARTS WITHIN</p>
    <div class="copy">
      <p>...</p>
      <p>...</p>
    </div>
    <a class="button" href="#">JOIN THE COMMUNITY</a>
  </section>
</main>
```

Include:

- proper `lang`
- UTF-8 charset
- viewport meta tag
- title
- meta description

## Expected files

Create or update:

```text
index.html
css/style.css
```

Use existing assets:

```text
assets/bg-desktop.jpg
assets/bg-mobile.jpg
```

Use existing references only for visual comparison:

```text
design/desktop-reference.png
design/mobile-reference.png
```

## Implementation instruction

Match the Figma references closely. Do not redesign the page. Do not add extra sections, navigation, animation, analytics, cookies, or dependencies.
