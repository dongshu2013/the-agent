import React from "react";
import { Cascader } from "antd";
import { Settings as SettingsIcon } from "lucide-react";

export interface ProviderGroup {
  type: string;
  models: { id: string; name: string }[];
}

interface ModelCascaderProps {
  providerGroups: ProviderGroup[];
  value?: [string, string];
  onChange?: (value: [string, string]) => void;
  onProviderSetting?: (providerType: string) => void;
}

const providerIcons: Record<string, React.ReactNode> = {
  deepseek: (
    <img
      src="/icons/deepseek.svg"
      style={{ width: 20, height: 20 }}
      alt="DeepSeek"
    />
  ),
  openai: (
    <img
      src="/icons/openai.svg"
      style={{ width: 20, height: 20 }}
      alt="OpenAI"
    />
  ),
  google: (
    <img
      src="/icons/google.svg"
      style={{ width: 20, height: 20 }}
      alt="Google"
    />
  ),
  anthropic: (
    <img
      src="/icons/anthropic.svg"
      style={{ width: 20, height: 20 }}
      alt="Anthropic"
    />
  ),
  default: null,
};

const ModelCascader: React.FC<ModelCascaderProps> = ({
  providerGroups,
  value,
  onChange,
  onProviderSetting,
}) => {
  const cascaderOptions = providerGroups.map((provider) => ({
    value: provider.type,
    label: provider.type.charAt(0).toUpperCase() + provider.type.slice(1),
    children: provider.models.map((model) => ({
      value: model.id,
      label: model.id === "system" ? "Mysta(default)" : model.name,
    })),
  }));

  const displayRender = (labels: string[]) => labels[labels.length - 1] || "";

  const optionRender = (option: any, context?: { level: number }) => {
    const isProvider =
      Array.isArray(option.children) && option.children.length > 0;
    if ((context && context.level === 0) || isProvider) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* {providerIcons[option.value] || providerIcons.default} */}
            <span>{option.label}</span>
          </div>
          {option.value !== "system" && (
            <button
              style={{
                background: "none",
                border: "none",
                padding: 0,
                marginLeft: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#aaa",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onProviderSetting?.(option.value);
              }}
              title="设置API Key"
            >
              <SettingsIcon size={18} />
            </button>
          )}
        </div>
      );
    }
    return <span>{option.label}</span>;
  };

  return (
    <Cascader
      options={cascaderOptions}
      value={value}
      onChange={(val) => onChange?.(val as [string, string])}
      displayRender={displayRender}
      optionRender={optionRender}
      style={{ width: "100%" }}
    />
  );
};

export default ModelCascader;
