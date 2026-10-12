import { ImageResponse } from "next/og";

export const alt = "Destroy The Decibel — The Battle of Exhausts. 17 October 2026, Thrissur.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#F7F7F5",
          backgroundColor: "#05070A",
          backgroundImage:
            "radial-gradient(circle at 78% 110%, rgba(255,90,31,0.75), rgba(240,24,36,0.25) 38%, rgba(5,7,10,0) 62%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: "#C9D0D6" }}>
          DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 900, lineHeight: 0.92, letterSpacing: -4 }}>
            DESTROY
          </div>
          <div style={{ display: "flex", fontSize: 168, fontWeight: 900, lineHeight: 0.92, letterSpacing: -4, color: "#C9D0D6" }}>
            THE DECIBEL
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, letterSpacing: 14, color: "#FF5A1F" }}>
            THE BATTLE OF EXHAUSTS
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, letterSpacing: 4 }}>
          <div style={{ display: "flex" }}>17 OCT 2026 · VIDYA ACADEMY, THRISSUR</div>
          <div style={{ display: "flex" }}>PRIZE POOL ₹40,000</div>
        </div>
      </div>
    ),
    size,
  );
}
