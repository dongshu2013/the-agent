import { Modal } from "antd";
import { env } from "~/utils/env";
import MystaLogo from "~/assets/mysta-logo.png";

export default function LoginModal({ open }: { open: boolean }) {
  const handleLogin = () => {
    const webUrl = env.WEB_URL;
    window.open(webUrl, "_blank");
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
        style={{ width: 64, height: 64, marginBottom: 16 }}
      />
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 2,
          marginBottom: 32,
        }}
      >
        MYSTA
      </div>
      {/* 登录按钮 */}
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
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "#fff";
        }}
      >
        <span>Sign in with Mysta Web</span>
      </button>
    </Modal>
  );
}
