# Measurement and search setup

This site is plain HTML/CSS served by Netlify. There is no build command, package manager, client router, server environment interpolation, or existing consent manager. The production response redirects the bare domain to `https://www.innataire.com/`. No hosting or DNS settings are changed here.

## Activation status

No analytics service is activated by this change. No real GA4 ID, Clarity ID, Google verification token, or Bing verification token was found in tracked files or available local configuration. Private Netlify environment settings and project secrets could not be inspected with the available connection; GitHub secret values cannot be read back. Check existing accounts before creating duplicate properties.

## Public configuration

Edit `js/measurement-config.js` and publish through the existing deployment process:

| Key | Value |
| --- | --- |
| `window.INNATAIRE_MEASUREMENT.environment` | `production` to allow loading; any other value disables both services |
| `window.INNATAIRE_MEASUREMENT.ga4MeasurementId` | The real GA4 web-stream Measurement ID (`G-...`); empty disables GA4 |
| `window.INNATAIRE_MEASUREMENT.clarityProjectId` | The real Clarity project ID; empty disables Clarity |

These identifiers are public browser configuration, not credentials. Never put API secrets, passwords or service-account credentials here. There are **no environment-variable keys**: setting Netlify environment variables alone will not change static files. Configuration changes must be published. Keep the two deferred script tags in their existing order on both HTML pages.

Even with IDs present, scripts load only on the exact origin `https://www.innataire.com` and with `environment: "production"`. Local files, localhost, HTTP, custom test ports and Netlify preview/staging hostnames do not load either provider. There is deliberately no preview override. A development/test deployment should also set environment to `development` or `test`. The host check is in `js/measurement.js`; do not expand it to preview hosts.

GA4 uses standard gtag and its single automatic page view on each document load. The site has no SPA routing. Do not add a second initial page_view event. Re-running the loader does not initialize the services twice; existing gtag/Clarity globals or provider scripts are respected. A future router will require reviewing page-view handling.

There are no custom events or declared conversions. The Substack button navigates to another site and does not prove a signup succeeded. Add a conversion only when an actual success signal is available. The existing `window.gtag` queue is the integration point after activation; do not send email addresses or other personal data as event parameters. Review account-level enhanced measurement settings separately.

## Search Console and Bing verification

The configuration points are the commented HTML meta tags in the **head of `index.html`**:

| HTML configuration key (`name`) | Value (`content`) |
| --- | --- |
| `google-site-verification` | Exact token supplied by Search Console |
| `msvalidate.01` | Exact token supplied by Bing Webmaster Tools |

Paste the actual supplied content and move that complete tag outside the comment (or replace the comment with the supplied tag). Leave an unconfigured service commented out. Do not publish empty tags or example tokens. Static tags are intentional: ownership verification must not depend on JavaScript, analytics IDs, or visitor consent.

1. In Google Search Console add/select the **URL-prefix property** `https://www.innataire.com/` and choose HTML-tag verification. A Domain property requires DNS and is outside this change.
2. In Bing Webmaster Tools add/select `https://www.innataire.com/` and choose HTML meta-tag verification, or use its import-from-Search-Console flow after Google verification.
3. Publish the supplied tags, inspect the live page source, then click Verify in each account. Keep the tags after successful verification.
4. Submit `https://www.innataire.com/sitemap.xml` in each account. Confirm live `robots.txt` and sitemap return HTTP 200 after deployment. Use Google URL Inspection for the homepage.

A provider-supplied verification HTML file can alternatively be placed at the repository root with its exact supplied filename and contents, then published. No file or token has been invented.

The sitemap contains only the current homepage. The retained `pre-index.html` is an obsolete coming-soon page and now has `noindex, follow`; robots allows fetching it so crawlers can see that directive. It keeps its own absolute canonical. The current homepage remains indexable. All canonical/social/schema URLs use the existing production hostname. There was no base-URL configuration or staging protection in the repository; existing host-level preview protections must remain intact.

## Privacy and consent decision before activation

There is no existing cookie banner, privacy page, or consent handling in this repository. No banner or consent platform is introduced. Supplying IDs causes the production loader to contact Google/Microsoft; this is not a consent gate or a compliance claim. The owner must decide the appropriate consent and privacy approach, especially for UK/EU visitors, before enabling measurement, including Clarity recording/masking and provider account settings. If consent is required, integrate a consent mechanism before enabling the IDs. Do not interpret environment/origin checks as visitor consent. Existing Google Fonts requests also remain unchanged.

## Validation

No build/lint/test command existed before this change; the committed HTML is the production output. No build framework or runtime dependency is added. Run the dependency-free regression checks with `node --test tests/measurement.test.cjs` and `python tests/check_html.py` when those tools are available. Browser checks should intercept provider scripts with test fixtures rather than sending test data to live properties.

After real IDs are deployed, confirm a single provider script per page and check GA4 Realtime/DebugView and Clarity's dashboard using the chosen consent policy. Browser blocking and account configuration can affect collection; local tests cannot establish receipt by either service.

## References

- [Google page-view behavior](https://developers.google.com/analytics/devguides/collection/ga4/views)
- [Microsoft Clarity installation](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup)
- [Google ownership verification](https://support.google.com/webmasters/answer/9008080)

Validation completed for this change: all six Node test groups and both static HTML checks passed; headless Edge passed production, localhost, Netlify preview, development/test and legacy-page checks using intercepted provider stubs. Desktop (1440 x 1000) and mobile (390 x 844) before/after screenshots were pixel-identical with external fonts blocked consistently in both captures. No real provider collection or account verification was claimed. The Windows sandbox required `node --preserve-symlinks --preserve-symlinks-main --test tests/measurement.test.cjs`.
