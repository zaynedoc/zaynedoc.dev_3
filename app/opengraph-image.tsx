import { ImageResponse } from "next/og";

export const alt = "Zayne Dockery — developer, ambassador, and undergraduate";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "flex-start",
        background: "#11182d",
        color: "#d7d5ef",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        height: "100%",
        justifyContent: "center",
        padding: "72px 76px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#d1aeef",
          display: "flex",
          fontSize: 30,
          marginBottom: 34,
        }}
      >
        zaynedoc.dev
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 860,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 64,
            letterSpacing: -1.5,
            lineHeight: 1.08,
          }}
        >
          Hey all, I’m Zayne Dockery
        </div>
        <div
          style={{
            color: "#d1aeef",
            display: "flex",
            fontSize: 32,
            marginTop: 28,
          }}
        >
          Developer · Ambassador · Undergraduate
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: 330,
          position: "absolute",
          right: 0,
          top: 0,
          width: 440,
        }}
      >
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0 10px, #74768e 10px 13px)",
            border: "2px solid #74768e",
            display: "flex",
            height: 110,
            left: 0,
            position: "absolute",
            top: 0,
            width: 110,
          }}
        />
        <div
          style={{
            alignItems: "center",
            background: "#74768e",
            color: "#11182d",
            display: "flex",
            fontSize: 190,
            height: 220,
            justifyContent: "center",
            lineHeight: 1,
            overflow: "hidden",
            position: "absolute",
            right: 110,
            top: 0,
            width: 220,
          }}
        >
          Aa
        </div>
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent 0 10px, #74768e 10px 13px)",
            border: "2px solid #74768e",
            bottom: 0,
            display: "flex",
            height: 110,
            position: "absolute",
            right: 220,
            width: 110,
          }}
        />
        <div
          style={{
            alignItems: "center",
            border: "2px solid #74768e",
            bottom: 0,
            display: "flex",
            height: 110,
            justifyContent: "center",
            position: "absolute",
            right: 0,
            width: 220,
          }}
        >
          {[0, 1, 2].map((diamond) => (
            <div
              key={diamond}
              style={{
                background: "#74768e",
                borderRadius: 8,
                display: "flex",
                height: 56,
                margin: "0 9px",
                transform: "rotate(45deg)",
                width: 56,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
