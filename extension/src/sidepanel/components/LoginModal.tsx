import { Modal } from 'antd';
import { env } from '~/utils/env';
import logoIcon from '~/assets/icon64.png';
import betaIcon from '~/assets/beta.png';
import { UserInfo } from '~/utils/db';

interface LoginModalProps {
  open: boolean;
  showSwitch: boolean;
  currentUser?: UserInfo | null;
  onClose?: () => void;
}

export default function LoginModal({ open, showSwitch, currentUser, onClose }: LoginModalProps) {
  const handleLogin = () => {
    const webUrl = env.WEB_URL;
    window.open(webUrl, '_blank');
  };

  const getDisplayName = (user?: UserInfo | null) => {
    if (!user) return 'None';
    return user.username || user.email || 'unknown';
  };

  return (
    <Modal
      open={open}
      footer={null}
      centered
      closable={false}
      width={400}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 24,
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '24px',
        }}
      >
        <img
          src={logoIcon}
          alt="Mysta Logo"
          style={{
            height: '40px',
          }}
        />
        <h2
          style={{
            margin: '0',
            fontSize: '40px',
            fontWeight: '600',
          }}
        >
          MYSTA
        </h2>
        <img
          src={betaIcon}
          alt="Beta"
          style={{
            height: '20px',
          }}
        />
      </div>
      {showSwitch ? (
        <>
          <div style={{ fontWeight: 500, marginBottom: 16 }}>
            New Mysta account detected
            <div style={{ fontSize: 14, color: '#333', marginTop: 8 }}>
              Account: <span style={{ color: '#888' }}>{getDisplayName(currentUser)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              maxWidth: 320,
              height: 48,
              borderRadius: 24,
              border: '1.5px solid #d1d5db',
              background: '#fff',
              color: '#222',
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 8,
              cursor: 'pointer',
            }}
          >
            OK
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            maxWidth: 320,
            height: 48,
            borderRadius: 24,
            border: '1.5px solid #d1d5db',
            background: '#000',
            fontSize: 18,
            fontWeight: 500,
            color: '#fff',
            marginBottom: 24,
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <span>Sign In with Mysta Web</span>
        </button>
      )}
    </Modal>
  );
}
