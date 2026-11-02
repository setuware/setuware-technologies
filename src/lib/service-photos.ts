/**
 * One photograph per service, used as the background of the service cards
 * (homepage carousel, /services index, related services) and the media panel
 * on each service page.
 *
 * All photos are from Pexels under the free Pexels licence
 * (https://www.pexels.com/license/): free for commercial use, no attribution
 * required, though we keep the credit here. Each file was cropped to 3:2 and
 * re-encoded to 1200×800 JPEG (q≈80) under `public/images/services/`; Next's
 * image pipeline serves AVIF/WebP from there.
 */

import type { ServiceKey } from "./pricing";

export interface ServicePhoto {
  /** Path under `public/`. */
  src: string;
  width: number;
  height: number;
  /** Describes the photo itself, for when it is not decorative. */
  alt: string;
  credit: string;
  pexelsId: number;
  /** Source page on Pexels. */
  pexelsUrl: string;
}

const photo = (
  slug: ServiceKey,
  pexelsId: number,
  pageSlug: string,
  photographer: string,
  alt: string,
): ServicePhoto => ({
  src: `/images/services/${slug}.jpg`,
  width: 1200,
  height: 800,
  alt,
  credit: `Photo: ${photographer} / Pexels`,
  pexelsId,
  pexelsUrl: `https://www.pexels.com/photo/${pageSlug}-${pexelsId}/`,
});

export const servicePhotos: Record<ServiceKey, ServicePhoto> = {
  "business-websites": photo(
    "business-websites",
    7446935,
    "businessman-working-on-laptop-in-cafe",
    "Gustavo Fring",
    "A business owner in a suit working on a laptop at a café table by the window",
  ),
  "ecommerce-stores": photo(
    "ecommerce-stores",
    39219885,
    "woman-shopping-online-with-credit-card-and-smartphone",
    "Vitaly Gariev",
    "A woman on a sofa paying for an online order with a card and her smartphone",
  ),
  "web-development": photo(
    "web-development",
    546819,
    "close-up-photo-of-programming-of-codes",
    "Luis Gomes",
    "Close-up of source code in a dark-themed editor on a laptop screen",
  ),
  "app-development": photo(
    "app-development",
    9956762,
    "hand-holding-cellphone-with-displayed-applications",
    "Emmanuel Jason Eliphalet",
    "A hand holding a smartphone with an app open, over a dark desk",
  ),
  "product-design": photo(
    "product-design",
    3471423,
    "person-writing-on-white-paper",
    "Fabian Wiktor",
    "A designer sketching mobile app screens on paper, with markers and sticky notes on the desk",
  ),
  "seo-marketing": photo(
    "seo-marketing",
    6476246,
    "a-person-holding-a-tablet-with-digital-marketing-pie-chart-on-screen",
    "Mikael Blomkvist",
    "A marketing team in a meeting, one person holding a tablet showing a pie chart",
  ),
  "custom-software": photo(
    "custom-software",
    4484149,
    "man-holding-tablet-computer",
    "Tiger Lily",
    "A warehouse worker checking stock on a tablet between loaded shelves",
  ),
  "ai-integration": photo(
    "ai-integration",
    8386440,
    "robot-pointing-on-a-wall",
    "Tara Winstead",
    "A robotic hand reaching into a glowing network of connected points on a blue background",
  ),
  "managed-hosting": photo(
    "managed-hosting",
    17323801,
    "network-rack",
    "panumas nikhomkhai",
    "Server racks in a data centre lit in deep blue",
  ),
  "support-maintenance": photo(
    "support-maintenance",
    8867435,
    "a-smiling-man-wearing-a-headset-looking-at-his-computer-screen",
    "Yan Krukov",
    "A support engineer wearing a headset, talking to a client while watching his monitor",
  ),
};

export function getServicePhoto(slug: ServiceKey): ServicePhoto {
  return servicePhotos[slug];
}
