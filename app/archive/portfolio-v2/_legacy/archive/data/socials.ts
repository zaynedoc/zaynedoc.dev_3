export interface Social {
  title: string;
  link: string;
  details: string;
  icon: string;   // filename in public/images/icons/
  image: string;  // filename in public/images/media/
}

export const socials: Social[] = [
  {
    title: "GitHub",
    link: "https://github.com/zaynedoc/",
    details: "My only GitHub account",
    icon: "githubIcon.png",
    image: "github.png",
  },
  {
    title: "LinkedIn",
    link: "https://linkedin.com/in/zaynedoc/",
    details: "My only LinkedIn account",
    icon: "linkedinIcon.png",
    image: "linkedin.png",
  },
  {
    title: "Instagram",
    link: "https://www.instagram.com/zaynedoc/",
    details: "My only Instagram account",
    icon: "instagramIcon.png",
    image: "instagram.png",
  },
];
