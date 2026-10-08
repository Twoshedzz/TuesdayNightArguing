export const SITE_TITLE = 'Tuesday Night Arguing';
export const SITE_SUBTITLE = 'Noct Strigbart and the five of us in five rooms';
export const SITE_TAGLINE = 'a campaign, as told by a bard who was there and a man who was on a call';
export const SITE_DESCRIPTION =
  'One Dungeons & Dragons campaign told twice over by the same person: Noct, a dwarf bard with a generous memory, and the bloke playing him on a Tuesday night over Discord.';

/**
 * Google Analytics 4 measurement ID for this site's web data stream.
 *
 * Not a secret: GA serves it in every visitor's page source. It lives here rather
 * than in a Netlify variable so there is one less thing to set up and one less
 * thing to forget. PUBLIC_GA_ID in the environment overrides it, which is how to
 * point a preview build at a different property without touching the code.
 *
 * This is this site's own stream. The Ruins of Ethium has a different one, in the
 * same GA property — crossing them over would merge both books into one number.
 *
 * Analytics still does nothing until a reader allows it — see components/Analytics.astro.
 */
export const GA_MEASUREMENT_ID = 'G-1X0V19M38G';
