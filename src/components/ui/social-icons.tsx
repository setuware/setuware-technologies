/**
 * Brand marks as inline SVG.
 *
 * `lucide-react` dropped brand icons, and pulling an icon font or a second
 * library for three glyphs is not worth the bytes.
 */
export type SocialIcon = (props: { className?: string }) => React.ReactElement;

export const LinkedInIcon: SocialIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.52 4.78 5.8V21h-4v-5.5c0-1.31-.03-3-1.9-3-1.9 0-2.2 1.43-2.2 2.9V21H9z" />
  </svg>
);

export const GitHubIcon: SocialIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2C6.48 2 2 6.52 2 12.1c0 4.46 2.87 8.24 6.84 9.58.5.1.68-.22.68-.49l-.01-1.7c-2.78.61-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.55 2.34 1.1 2.91.84.09-.66.35-1.1.63-1.36-2.22-.26-4.56-1.13-4.56-5.02 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.04A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.31 2.75-1.04 2.75-1.04.55 1.4.2 2.43.1 2.69.64.71 1.03 1.62 1.03 2.73 0 3.9-2.34 4.76-4.57 5.01.36.32.68.93.68 1.88l-.01 2.79c0 .27.18.59.69.49A10.11 10.11 0 0 0 22 12.1C22 6.52 17.52 2 12 2z" />
  </svg>
);

export const XIcon: SocialIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23zm-1.16 17.52h1.83L7.01 4.13H5.04z" />
  </svg>
);
