import { useSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import { FaDiscord, FaSignOutAlt, FaLink, FaUserShield } from "react-icons/fa";
import { AppLayout } from "~/components/AppLayout/AppLayout";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <AppLayout title="Account">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <div style={{ textAlign: "center", color: "var(--text-main)" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AppLayout title="Account">
        <Head><title>Account – FF6WC</title></Head>
        <div style={{
          maxWidth: "480px",
          margin: "4rem auto",
          padding: "2.5rem",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          textAlign: "center",
          color: "var(--text-main)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            <FaDiscord color="#5865F2" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Sign in to your account
          </h1>
          <p style={{ color: "var(--text-sub)", fontSize: "0.95rem", marginBottom: "2rem" }}>
            Link your Discord account to manage preferences and access account settings.
          </p>
          <button
            onClick={() => signIn("discord")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 2rem",
              background: "#5865F2",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 4px 16px rgba(88, 101, 242, 0.4)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "none")}
          >
            <FaDiscord size={20} />
            Login with Discord
          </button>
        </div>
      </AppLayout>
    );
  }

  // Authenticated
  const user = session!.user!;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <AppLayout title="Account">
      <Head><title>Account – FF6WC</title></Head>

      <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Profile card */}
        <div style={{
          padding: "2rem",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          color: "var(--text-main)",
        }}>
          {user.image ? (
            <img
              src={user.image}
              alt="Discord Avatar"
              style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid #5865F2", flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #5865F2, #9B59B6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.75rem", fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: "var(--text-sub)", fontSize: "0.9rem", marginTop: "0.25rem" }}>{user.email}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              marginTop: "0.5rem", fontSize: "0.8rem", fontWeight: 600,
              color: "#5865F2", background: "rgba(88,101,242,0.1)",
              padding: "0.2rem 0.75rem", borderRadius: "999px",
            }}>
              <FaDiscord size={13} /> Discord Linked
            </div>
          </div>
        </div>

        {/* Site administration section */}
        <div style={{
          padding: "2rem",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          color: "var(--text-main)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <FaUserShield size={20} color="#5865F2" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Site Administration</h2>
          </div>
          <p style={{ color: "var(--text-sub)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Manage your site roles and permissions. Administrators can link external API access to their Discord identity.
          </p>

          <div style={{
            padding: "1rem",
            background: "var(--bg-app)",
            borderRadius: "10px",
            border: "1px solid var(--border-light)",
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>API Linking</div>
              <div style={{ color: "var(--text-sub)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                Connect this Discord account to site administration privileges
              </div>
            </div>
            <button
              onClick={() => alert("API linking is not yet implemented.")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.6rem 1.25rem",
                background: "var(--bg-input)",
                border: "1px solid var(--border-input)",
                borderRadius: "8px",
                color: "var(--text-main)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <FaLink size={14} /> Link Account
            </button>
          </div>
        </div>

        {/* Logout */}
        <div style={{
          padding: "1.5rem 2rem",
          background: "var(--bg-card)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-main)",
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>Sign Out</div>
            <div style={{ color: "var(--text-sub)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
              You will be returned to the home page.
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/create" })}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              padding: "0.65rem 1.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
