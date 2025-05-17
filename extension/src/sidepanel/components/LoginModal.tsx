import { Modal } from "antd";
import { env } from "~/utils/env";
import MystaLogo from "~/assets/mysta-logo.png";
import { UserInfo } from "~/utils/db";

interface LoginModalProps {
  open: boolean;
  showSwitch: boolean;
  pendingUser?: UserInfo | null;
  currentUser?: UserInfo | null;
  onContinue?: () => void;
  onClose?: () => void;
}

export default function LoginModal({
  open,
  showSwitch,
  pendingUser,
  currentUser,
  onContinue,
  onClose,
}: LoginModalProps) {
  const handleLogin = () => {
    const webUrl = env.WEB_URL;
    window.open(webUrl, "_blank");
  };

  // 获取友好的用户名
  const getDisplayName = (user?: UserInfo | null) => {
    if (!user) return "None";
    return user.username || user.email || "unknown";
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      closable={false}
      width={400}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 24,
      }}
    >
      {/* Logo */}
      <img
        src={MystaLogo}
        alt="Mysta Logo"
        style={{ width: 218, height: "auto", marginBottom: 16 }}
      />
      {showSwitch ? (
        <>
          <div style={{ color: "#e11d48", fontWeight: 500, marginBottom: 16 }}>
            Detected Mysta account change, switch?
            <div style={{ fontSize: 14, color: "#333", marginTop: 8 }}>
              Current account:{" "}
              <span style={{ color: "#888" }}>
                {getDisplayName(currentUser)}
              </span>
              <br />
              New account:{" "}
              <span style={{ color: "#22c55e" }}>
                {getDisplayName(pendingUser)}
              </span>
            </div>
          </div>
          <button
            onClick={onContinue}
            style={{
              width: "100%",
              maxWidth: 320,
              height: 48,
              borderRadius: 24,
              border: "1.5px solid #d1d5db",
              background: "#22c55e",
              color: "#fff",
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 16,
              cursor: "pointer",
            }}
          >
            Switch Account
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              maxWidth: 320,
              height: 48,
              borderRadius: 24,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              color: "#222",
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            maxWidth: 320,
            height: 48,
            borderRadius: 24,
            border: "1.5px solid #d1d5db",
            background: "#fff",
            fontSize: 18,
            fontWeight: 500,
            color: "#222",
            marginBottom: 24,
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
            cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          <span>Sign in with Mysta Web</span>
        </button>
      )}
    </Modal>
  );
}
