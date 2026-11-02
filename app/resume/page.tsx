import type { Metadata } from "next";
import Link from "next/link";

import { noIndexRobots } from "../seo";

const resumePath = "/Zayne_Dockery_Resume.pdf";

export const metadata: Metadata = {
  title: {
    absolute: "Resume | Zayne Dockery",
  },
  description: "Resume for Zayne Dockery.",
  robots: noIndexRobots,
};

export default function ResumePage() {
  return (
    <main className="resume-page">
      <header className="resume-toolbar">
        <Link href="/">zaynedoc.dev</Link>
        <div className="resume-toolbar__actions">
          <a href={resumePath} target="_blank" rel="noopener noreferrer">
            Open PDF
          </a>
          <a download href={resumePath}>
            Download
          </a>
        </div>
      </header>

      <object
        aria-label="Zayne Dockery resume"
        className="resume-document"
        data={resumePath}
        type="application/pdf"
      >
        <section className="resume-fallback">
          <h1>Zayne Dockery&apos;s resume</h1>
          <p>
            Your browser cannot display this PDF. <a href={resumePath}>Open the resume</a> instead.
          </p>
        </section>
      </object>
    </main>
  );
}
