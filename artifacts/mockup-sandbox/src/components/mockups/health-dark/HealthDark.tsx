import { useState, useEffect } from "react";

const FOOD_ICONS = ["🥗", "🍱", "🥩", "🥦", "🍣", "🥑", "🍗", "🫐", "🥕", "🍎", "🫙", "🥝"];

function FloatingIcon({ icon, style }: { icon: string; style: React.CSSProperties }) {
  return (
    <span
      style={{
        position: "absolute",
        fontSize: "28px",
        opacity: 0.18,
        animation: "floatUp 6s ease-in-out infinite",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

function LandingScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* Floating food icons */}
      {FOOD_ICONS.map((icon, i) => (
        <FloatingIcon
          key={i}
          icon={icon}
          style={{
            left: `${(i * 37 + 5) % 90}%`,
            bottom: "-10%",
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${5 + (i % 4)}s`,
            fontSize: i % 3 === 0 ? "34px" : "22px",
          }}
        />
      ))}

      {/* Glow circles */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,184,122,0.15) 0%, transparent 70%)",
          top: "10%",
          left: "-80px",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,184,122,0.10) 0%, transparent 70%)",
          bottom: "15%",
          right: "-60px",
          animation: "pulse 5s ease-in-out infinite reverse",
        }}
      />

      {/* Top nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px 20px",
          gap: "8px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: "12px",
            fontWeight: 600,
            padding: "7px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.3px",
          }}
        >
          Login
        </button>
        <button
          style={{
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "12px",
            fontWeight: 700,
            padding: "7px 16px",
            borderRadius: "20px",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.3px",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Hero content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #1A9B63, #2DB87A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            marginBottom: "24px",
            boxShadow: "0 0 40px rgba(45,184,122,0.4)",
            animation: "logoGlow 3s ease-in-out infinite",
          }}
        >
          🌿
        </div>

        <h1
          style={{
            color: "#fff",
            fontSize: "34px",
            fontWeight: 800,
            margin: "0 0 10px 0",
            textAlign: "center",
            letterSpacing: "-0.8px",
            lineHeight: 1.1,
          }}
        >
          Health Bite
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "15px",
            fontWeight: 400,
            margin: "0 0 8px 0",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Eat smart. Feel great.
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "12px",
            textAlign: "center",
            maxWidth: "220px",
            lineHeight: 1.6,
          }}
        >
          Personalized nutrition goals matched to restaurants near you
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: "8px", marginTop: "28px", flexWrap: "wrap", justifyContent: "center" }}>
          {["📍 Location-based", "🔥 Calorie-smart", "⭐ Rated meals"].map((f) => (
            <span
              key={f}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                fontSize: "11px",
                padding: "5px 12px",
                borderRadius: "20px",
                fontWeight: 500,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: "24px 24px 36px", position: "relative", zIndex: 10 }}>
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "15px",
            fontWeight: 700,
            padding: "15px",
            borderRadius: "14px",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.2px",
            marginBottom: "10px",
          }}
        >
          Get Started →
        </button>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", textAlign: "center", margin: 0 }}>
          Free · No credit card required
        </p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top background image area */}
      <div
        style={{
          height: "220px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #0f1f16 0%, #1a3327 50%, #0a0a0a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {/* Grid pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(45,184,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,184,122,0.06) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #1A9B63, #2DB87A)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              position: "relative",
              zIndex: 1,
              boxShadow: "0 0 30px rgba(45,184,122,0.35)",
            }}
          >
            🌿
          </div>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "20px",
              position: "relative",
              zIndex: 1,
              letterSpacing: "-0.3px",
            }}
          >
            Health Bite
          </span>
        </div>
        {/* Fade to bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60px",
            background: "linear-gradient(transparent, #0A0A0A)",
          }}
        />
      </div>

      {/* Form area */}
      <div style={{ flex: 1, padding: "8px 24px 0", display: "flex", flexDirection: "column" }}>
        <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.4px" }}>
          Welcome back
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 24px" }}>
          Sign in to your account
        </p>

        {/* Email */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Email
          </label>
          <div
            style={{
              background: "#161616",
              border: `1.5px solid ${focused === "email" ? "#fff" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px",
              padding: "13px 16px",
              color: "rgba(255,255,255,0.35)",
              fontSize: "14px",
              transition: "border-color 0.2s",
              cursor: "text",
            }}
            onMouseEnter={() => setFocused("email")}
            onMouseLeave={() => setFocused(null)}
          >
            you@example.com
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Password
          </label>
          <div
            style={{
              background: "#161616",
              border: `1.5px solid ${focused === "pass" ? "#fff" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "12px",
              padding: "13px 16px",
              color: "rgba(255,255,255,0.35)",
              fontSize: "14px",
              cursor: "text",
            }}
            onMouseEnter={() => setFocused("pass")}
            onMouseLeave={() => setFocused(null)}
          >
            ••••••••
          </div>
        </div>

        {/* Sign In button */}
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "15px",
            fontWeight: 700,
            padding: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.1px",
            marginBottom: "14px",
          }}
        >
          Sign In
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Create account button */}
        <button
          style={{
            width: "100%",
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            padding: "13px",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Create New Account
        </button>
      </div>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", textAlign: "center", padding: "16px 0 24px" }}>
        Any valid email · 6+ character password
      </p>
    </div>
  );
}

function SignUpScreen() {
  const [focused, setFocused] = useState<string | null>(null);

  const fields = [
    { key: "name", label: "Full Name", placeholder: "John Doe" },
    { key: "email", label: "Email", placeholder: "you@example.com" },
    { key: "password", label: "Password", placeholder: "Min 6 characters" },
    { key: "confirm", label: "Confirm Password", placeholder: "Re-enter password" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          ←
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.3px" }}>
            Create Account
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
            Join Health Bite today
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #1A9B63, #2DB87A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🌿
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 0" }}>
        {fields.map((f) => (
          <div key={f.key} style={{ marginBottom: "14px" }}>
            <label
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "7px",
              }}
            >
              {f.label}
            </label>
            <div
              style={{
                background: "#161616",
                border: `1.5px solid ${focused === f.key ? "#fff" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px",
                padding: "12px 16px",
                color: "rgba(255,255,255,0.3)",
                fontSize: "14px",
                cursor: "text",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={() => setFocused(f.key)}
              onMouseLeave={() => setFocused(null)}
            >
              {f.key === "password" || f.key === "confirm" ? "••••••••" : f.placeholder}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div style={{ padding: "16px 24px 28px", flexShrink: 0 }}>
        <button
          style={{
            width: "100%",
            background: "#fff",
            border: "none",
            color: "#000",
            fontSize: "15px",
            fontWeight: 700,
            padding: "14px",
            borderRadius: "12px",
            cursor: "pointer",
            fontFamily: "inherit",
            marginBottom: "12px",
          }}
        >
          Create Account →
        </button>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", textAlign: "center", margin: 0 }}>
          Already have an account?{" "}
          <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Sign In</span>
        </p>
      </div>
    </div>
  );
}

function PhoneFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      <div
        style={{
          width: "320px",
          height: "620px",
          borderRadius: "40px",
          background: "#1a1a1a",
          padding: "10px",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(45,184,122,0.05)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90px",
            height: "22px",
            background: "#0A0A0A",
            borderRadius: "12px",
            zIndex: 20,
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "32px",
            overflow: "hidden",
            background: "#0A0A0A",
            paddingTop: "36px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.7)",
          fontSize: "12px",
          fontWeight: 600,
          padding: "6px 18px",
          borderRadius: "20px",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function HealthDark() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0.18; }
          50%  { transform: translateY(-300px) rotate(15deg); opacity: 0.22; }
          100% { transform: translateY(-620px) rotate(-5deg); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(45,184,122,0.35); }
          50%       { box-shadow: 0 0 60px rgba(45,184,122,0.6); }
        }
      `}</style>

      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          background: "radial-gradient(ellipse at 30% 20%, #0d1f15 0%, #050505 60%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
          fontFamily: "'Inter', -apple-system, sans-serif",
          gap: "40px",
        }}
      >
        {/* Top label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "2px", background: "rgba(45,184,122,0.5)", borderRadius: "2px" }} />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>
              Health Bite · Redesign
            </span>
            <div style={{ width: "32px", height: "2px", background: "rgba(45,184,122,0.5)", borderRadius: "2px" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px", textAlign: "center" }}>
            Dark Theme · Uber-style UI
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", margin: 0 }}>
            Three-screen flow: Landing → Login → Sign Up
          </p>
        </div>

        {/* Three phone screens */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <PhoneFrame label="01 · Landing Screen">
            <LandingScreen />
          </PhoneFrame>
          <PhoneFrame label="02 · Login Screen">
            <LoginScreen />
          </PhoneFrame>
          <PhoneFrame label="03 · Sign Up Screen">
            <SignUpScreen />
          </PhoneFrame>
        </div>

        {/* Design notes */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: "900px",
          }}
        >
          {[
            { icon: "⬛", label: "Black & White", desc: "Uber-inspired monochrome palette" },
            { icon: "🌿", label: "Green Accent", desc: "Brand identity stays intact" },
            { icon: "✨", label: "Animated Landing", desc: "Floating food icons + glow effects" },
            { icon: "📱", label: "Mobile-First", desc: "Designed for React Native / Expo" },
          ].map((note) => (
            <div
              key={note.label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "20px" }}>{note.icon}</span>
              <div>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{note.label}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>{note.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
