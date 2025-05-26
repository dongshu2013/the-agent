import { Modal } from 'antd';
import { env } from '~/utils/env';
import logoIcon from '~/assets/mysta-logo-brand-beta.png';
import { UserInfo } from '~/utils/db';

interface LoginModalProps {
  open: boolean;
  isSwitch?: boolean;
  currentUser?: UserInfo | null;
  text?: string;
  onClose?: () => void;
}

export default function LoginModal({
  open,
  isSwitch,
  currentUser,
  text,
  onClose,
}: LoginModalProps) {
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
      width={300}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        content: {
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
          marginBottom: '10px',
        }}
      >
        <img
          src={logoIcon}
          alt="Mysta Logo"
          style={{
            height: '40px',
          }}
        />
      </div>
      {isSwitch ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 500, textAlign: 'center' }}>
            Mysta Account Detected
          </div>
          <div style={{ fontSize: 14, color: '#333', textAlign: 'center' }}>
            <span style={{ color: '#888' }}>{getDisplayName(currentUser)}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              maxWidth: 320,
              height: 48,
              borderRadius: 12,
              border: '1.5px solid #d1d5db',
              background: '#fff',
              color: '#222',
              fontSize: 16,
              fontWeight: 500,
              marginTop: 16,
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
            borderRadius: 12,
            border: '1.5px solid #d1d5db',
            background: '#000',
            fontSize: 16,
            fontWeight: 500,
            color: '#fff',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <span>{text || 'Sign In with Mysta Web'}</span>
        </button>
      )}
    </Modal>
  );
}
