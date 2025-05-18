export interface MarkdownOptions {
  codeBlockStyle?: string;
  inlineCodeStyle?: string;
  linkStyle?: string;
  imageStyle?: string;
  listItemStyle?: string;
  headingStyles?: {
    h1?: string;
    h2?: string;
    h3?: string;
  };
  blockquoteStyle?: string;
}

const defaultOptions: MarkdownOptions = {
  codeBlockStyle:
    'background-color: #f6f8fa; padding: 6px 8px; border-radius: 4px; margin: 2px 0; font-size: 13px; line-height: 1.2; font-family: monospace;',
  inlineCodeStyle:
    'background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;',
  linkStyle: 'color: #0366d6; text-decoration: none;',
  imageStyle: 'max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0; display: block;',
  listItemStyle: 'margin-left: 20px;',
  headingStyles: {
    h1: 'font-size: 1.5em; margin: 16px 0;',
    h2: 'font-size: 1.3em; margin: 14px 0;',
    h3: 'font-size: 1.1em; margin: 12px 0;',
  },
  blockquoteStyle:
    'border-left: 3px solid #e1e4e8; margin: 8px 0; padding-left: 16px; color: #6a737d;',
};

function processImages(content: string, imageStyle: string): string {
  // 默认图片样式
  const defaultImageStyle =
    'max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0; display: block;';
  const finalImageStyle = imageStyle || defaultImageStyle;

  // 如果内容已经是HTML img标签，检查并修复样式
  if (content.includes('<img')) {
    return content.replace(/<img([^>]*)>/g, (_match, attributes) => {
      // 保留原有属性，但更新样式
      const styleAttr = `style="${finalImageStyle}"`;
      // 移除旧的style属性（如果存在）
      const cleanedAttributes = attributes.replace(/style="[^"]*"/, '');
      return `<img${cleanedAttributes} ${styleAttr}>`;
    });
  }

  // 处理 Markdown 格式的图片
  content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, src) => {
    // 解码HTML实体
    const decodedSrc = src.replace(/&amp;/g, '&').trim();
    return `<img src="${decodedSrc}" alt="${alt || ''}" style="${finalImageStyle}" />`;
  });

  // 处理以感叹号开头的行
  content = content.replace(/^!(.*?)$/gm, (match, text) => {
    // 处理base64图片数据
    if (text.includes('data:image/')) {
      const base64Match = text.match(/(data:image\/[^;]+;base64,[^"\s]+)/);
      if (base64Match) {
        const cleanData = base64Match[1].trim();
        return `<img src="${cleanData}" style="${finalImageStyle}" />`;
      }
    }

    // 处理URL图片
    if (text.startsWith('http')) {
      const cleanUrl = text.trim();
      return `<img src="${cleanUrl}" style="${finalImageStyle}" />`;
    }

    // 如果是图片描述文本，保持原样
    if (
      text.includes('Twitter Profile') ||
      text.includes('screenshot') ||
      text.includes('Screenshot')
    ) {
      return match;
    }

    return match;
  });

  // 直接处理内容中的base64数据
  content = content.replace(/(data:image\/[^;]+;base64,[^"\s]+)/g, match => {
    const cleanData = match.trim();
    return `<img src="${cleanData}" style="${finalImageStyle}" />`;
  });

  return content;
}

export function processMarkdown(content: string, options: MarkdownOptions = {}): string {
  const mergedOptions = { ...defaultOptions, ...options };

  // 首先处理图片
  content = processImages(content, mergedOptions.imageStyle || '');

  // 转义特殊字符
  content = content
    // 转义 $ 符号，但保留货币格式
    .replace(/\$/g, (match, offset, str) => {
      // 如果 $ 后面跟着数字，说明是货币符号，保持原样
      if (/\d/.test(str[offset + 1])) {
        return match;
      }
      // 否则转义
      return '\\$';
    });

  return (
    content
      // 处理代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre style="${mergedOptions.codeBlockStyle}"><code class="language-${lang || ''}" style="white-space: pre;">${code.trim()}</code></pre>`;
      })
      // 处理行内代码
      .replace(/`([^`]+)`/g, `<code style="${mergedOptions.inlineCodeStyle}">$1</code>`)
      // 处理粗体
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // 处理斜体
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // 处理链接
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        `<a href="$2" target="_blank" rel="noopener noreferrer" style="${mergedOptions.linkStyle}">$1</a>`
      )
      // 处理列表
      .replace(/^\s*[-*]\s+(.+)$/gm, `<li style="${mergedOptions.listItemStyle}">$1</li>`)
      // 处理标题
      .replace(/^#\s+(.+)$/gm, `<h1 style="${mergedOptions.headingStyles?.h1}">$1</h1>`)
      .replace(/^##\s+(.+)$/gm, `<h2 style="${mergedOptions.headingStyles?.h2}">$1</h2>`)
      .replace(/^###\s+(.+)$/gm, `<h3 style="${mergedOptions.headingStyles?.h3}">$1</h3>`)
      // 处理引用
      .replace(
        /^>\s+(.+)$/gm,
        `<blockquote style="${mergedOptions.blockquoteStyle}">$1</blockquote>`
      )
      // 处理换行
      .replace(/\n/g, '<br>')
      // 最后还原转义的特殊字符
      .replace(/\\(\$)/g, '$1')
  );
}
