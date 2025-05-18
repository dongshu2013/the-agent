import { MessageCircleMore, SquarePen, User as UserIcon } from 'lucide-react';
import { db, systemModelId } from '~/utils/db';
import { useState, useEffect } from 'react';
import { Modal, Dropdown } from 'antd';
import { ProviderGroup } from './ModelCascader';
import { useLiveQuery } from 'dexie-react-hooks';
import { Model } from '~/types';
import { ItemType } from 'antd/es/menu/interface';

interface HeaderProps {
  createNewConversation: () => void;
  setShowConversationList: (value?: boolean) => void;
}

const Header = ({ createNewConversation, setShowConversationList }: HeaderProps) => {
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [, setSelectedModelId] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [editingProvider] = useState<string | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const user = useLiveQuery(() => db.getCurrentUser(), []);
  const models = useLiveQuery(() => (user?.id ? db.getUserModels(user.id) : []), [user?.id]);

  useEffect(() => {
    const init = async () => {
      // 构建 fullProviderGroups（含完整模型信息）
      const fullGroups: Record<string, any> = {};
      (models ?? []).forEach(model => {
        if (!fullGroups[model.type]) {
          fullGroups[model.type] = {
            type: model.type,
            models: [],
          };
        }
        fullGroups[model.type].models.push(model);
      });
      const fullProviderGroups = Object.values(fullGroups);

      const providerGroups = fullProviderGroups.map((g: any) => ({
        type: g.type === 'system' ? 'Default' : g.type,
        models: g.models.map((m: any) => ({ id: m.id, name: m.name })),
      }));
      setProviderGroups(providerGroups);

      // 默认选中 Default provider 和 systemModelId
      let defaultProvider = 'Default';
      let defaultModelId = systemModelId;

      // 如果有 Default provider
      const defaultGroup = providerGroups.find(g => g.type === 'Default');
      if (defaultGroup) {
        defaultProvider = defaultGroup.type;
        const systemModel = defaultGroup.models.find((m: Model) => m.id === systemModelId);
        if (systemModel) {
          defaultModelId = systemModelId;
        } else if (defaultGroup.models.length > 0) {
          defaultModelId = defaultGroup.models[0].id;
        }
      } else if (providerGroups.length > 0) {
        defaultProvider = providerGroups[0].type;
        defaultModelId = providerGroups[0].models[0]?.id;
      }

      if (user?.selectedModelId) {
        providerGroups.forEach(group => {
          const match = group.models.find((m: Model) => m.id === user.selectedModelId);
          if (match) {
            defaultProvider = group.type;
            defaultModelId = match.id;
          }
        });
      }

      setSelectedProvider(defaultProvider);
      setSelectedModelId(defaultModelId);
    };
    init();
  }, [user, models]);

  // When provider changes, update model selection
  useEffect(() => {
    if (!selectedProvider && providerGroups.length > 0) {
      setSelectedProvider(providerGroups[0].type);
    }
    const group = providerGroups.find(g => g.type === selectedProvider);
    if (group && group.models.length > 0) {
      setSelectedModelId(group.models[0].id);
    }
  }, [selectedProvider, providerGroups]);

  const handleApiKeySave = async () => {
    try {
      // Update all models for this provider with the new API key
      const user = await db.getCurrentUser();
      if (user) {
        const userModels = await db.getUserModels(user.id);
        const modelsToUpdate = userModels.filter((m: any) => m.type === editingProvider);
        for (const model of modelsToUpdate) {
          await db.addOrUpdateModel({
            ...model,
            apiKey: apiKeyInput,
            type: editingProvider || '',
            userId: user.id,
          });
        }
        // Refresh provider groups
        const groups: Record<string, ProviderGroup> = {};
        userModels.forEach((model: any) => {
          if (!groups[model.type]) {
            groups[model.type] = {
              type: model.type,
              models: [],
            };
          }
          groups[model.type].models.push({ id: model.id, name: model.name });
        });
        setProviderGroups(Object.values(groups));
      }
      setApiModalOpen(false);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  };

  const menuItems = [
    {
      key: 'profile',
      label: user?.email || user?.username || 'User',
      disabled: true,
    },
    {
      type: 'divider',
    },
    // Add more items as needed
    {
      key: 'view-profile',
      label: 'View Profile',
      onClick: () => {
        window.open(process.env.PLASMO_PUBLIC_WEB_URL || '', '_blank');
      },
    },
  ];

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '50%',
    padding: 0,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: '0 16px',
        height: '44px',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '44px',
          gap: '4px',
        }}
      >
        <button
          style={buttonStyle}
          onClick={() => setShowConversationList(true)}
          onMouseOver={e => {
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.backgroundColor = '#E5E7EB';
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
        >
          <MessageCircleMore color="#374151" />
        </button>
        <span
          style={{
            fontSize: '13px',
            color: '#059669',
            fontWeight: 600,
            background: '#ECFDF5',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #D1FAE5',
            letterSpacing: '0.02em',
          }}
        >
          BETA
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* <ModelCascader
          providerGroups={providerGroups as ProviderGroup[]}
          value={cascaderValue as [string, string]}
          onChange={handleCascaderChange}
          onProviderSetting={handleProviderSetting}
        /> */}
        <button
          style={buttonStyle}
          onClick={createNewConversation}
          onMouseOver={e => {
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.backgroundColor = '#E5E7EB';
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
        >
          <SquarePen color="#374151" />
        </button>
        <Dropdown
          menu={{ items: menuItems as ItemType[] }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button
            style={buttonStyle}
            onMouseOver={e => {
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.backgroundColor = '#E5E7EB';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.username || 'User'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                }}
              />
            ) : (
              <UserIcon color="#374151" />
            )}
          </button>
        </Dropdown>
      </div>

      {/* API Key Modal */}
      <Modal
        open={apiModalOpen}
        onCancel={() => setApiModalOpen(false)}
        footer={null}
        centered
        closable
        style={{
          background: '#fff',
          borderRadius: 10,
          color: '#111',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
          Set API Key:
          {editingProvider
            ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1)
            : ''}
        </div>

        <div
          style={{
            width: '100%',
            gap: 12,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <input
            placeholder={`Enter ${editingProvider ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1) + ' API Key' : 'API Key'}`}
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            style={{
              width: '100%',
              height: 32,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              background: '#fafafa',
              color: '#111',
              padding: '0 8px',
              marginBottom: 10,
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              width: '100%',
            }}
          >
            <button
              style={{
                background: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 0',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
                marginBottom: 8,
                boxSizing: 'border-box',
              }}
              onClick={handleApiKeySave}
            >
              Save
            </button>
            <button
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '7px 0',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                width: '100%',
                boxSizing: 'border-box',
              }}
              onClick={() => setApiModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Header;
