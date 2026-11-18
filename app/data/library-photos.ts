import type { ProjectCarouselSlide } from "../components/project-carousel";

// Add physical CD photos to public/images/library, then list them in display order.
// The overview slideshow displays these at a 4:3 aspect ratio.
export const libraryPhotos: readonly ProjectCarouselSlide[] = [
  { src: "/images/library/library1.jpg", alt: "CD collection displayed on shelves, including Parousia and Agartha" },
  { src: "/images/library/library2.jpg", alt: "Several CD albums spread across a table" },
  { src: "/images/library/library3.jpg", alt: "Studio Ghibli soundtrack CDs and artwork arranged on a table" },
  { src: "/images/library/library4.jpg", alt: "Sou's Solution CD opened to show the disc and liner notes" },
];
