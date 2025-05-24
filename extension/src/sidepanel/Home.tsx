import bgImg from '~/assets/bg.png';
import bgLogo from '~/assets/bg-logo.png';
import { env } from '~/utils/env';

const Home = () => (
  <div
    style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: `url(${bgImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'bottom',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 10,
    }}
  >
    <div style={{ flex: 1 }} />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        zIndex: 2,
      }}
    >
      <img src={bgLogo} alt="Mysta Logo" style={{ width: 120, height: 120, marginBottom: 32 }} />
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 16,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        Let AI Run the Web for You
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 400,
          color: '#d1d5db',
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        Ask anything. Automate Everything.
      </div>
      <button
        style={{
          width: '90%',
          maxWidth: 320,
          height: 50,
          borderRadius: 12,
          border: 'none',
          background: '#fff',
          color: '#232323',
          fontSize: 18,
          fontWeight: 500,
          marginBottom: 32,
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onClick={() => window.open(env.WEB_URL, '_blank')}
      >
        Get started
      </button>
    </div>
    <div style={{ flex: 2 }} />
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        width: '100%',
        textAlign: 'center',
        color: '#d1d5db',
        fontSize: 13,
        letterSpacing: 0.1,
        zIndex: 2,
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}
    >
      Mysta Al assistant may produce inaccurate information. Your data is kept private.
    </div>
  </div>
);

export default Home;
