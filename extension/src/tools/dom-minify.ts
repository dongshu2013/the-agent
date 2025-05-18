export interface DomNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DomNode[];
  textContent?: string;
  id?: string;
  selector?: string;
  xpath?: string;
}

export class DomTree {
  root: DomNode;
  selectors: Record<string, string>;
  selectorPaths: Map<string, DomNode>;
  xpathMap: Map<string, DomNode>;

  constructor(root: DomNode) {
    this.root = root;
    this.selectors = {};
    this.selectorPaths = new Map();
    this.xpathMap = new Map();
    this.buildSelectorPaths(root);
  }

  private buildSelectorPaths(node: DomNode, parentPath: string = '') {
    let currentPath = parentPath;

    // 如果有 xpath 属性，保存到 xpathMap
    if (node.attributes.xpath) {
      node.xpath = node.attributes.xpath;
      this.xpathMap.set(node.xpath, node);
    }

    if (node.id) {
      currentPath = `#${node.id}`;
    } else if (node.attributes.type || node.attributes.name) {
      const type = node.attributes.type ? `[type="${node.attributes.type}"]` : '';
      const name = node.attributes.name ? `[name="${node.attributes.name}"]` : '';
      currentPath += (currentPath ? ' > ' : '') + `${node.tagName}${type}${name}`;
    } else {
      const siblings = parentPath ? this.findSiblings(node, parentPath) : [];
      const index = siblings.length;
      currentPath += (currentPath ? ' > ' : '') + `${node.tagName}:nth-child(${index + 1})`;
    }

    node.selector = currentPath;
    this.selectorPaths.set(currentPath, node);

    node.children.forEach(child => {
      this.buildSelectorPaths(child, currentPath);
    });
  }

  private findSiblings(node: DomNode, parentPath: string): DomNode[] {
    const siblings: DomNode[] = [];
    const parent = this.findNodeBySelector(parentPath);
    if (parent) {
      siblings.push(...parent.children.filter(child => child.tagName === node.tagName));
    }
    return siblings;
  }

  findNodeBySelector(selector: string): DomNode | undefined {
    return this.selectorPaths.get(selector);
  }

  findNodeByXPath(xpath: string): DomNode | undefined {
    return this.xpathMap.get(xpath);
  }

  addSelector(selector: string, path: string) {
    this.selectors[selector] = path;
  }
}

export function parseHtml(html: string): DomTree {
  // 1. 移除注释
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // 2. 处理转义字符
  html = html
    // 处理属性中的转义字符
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\&quot;/g, '"')
    .replace(/\\&amp;/g, '&')
    .replace(/\\&lt;/g, '<')
    .replace(/\\&gt;/g, '>')
    .replace(/\\&nbsp;/g, ' ')
    // 处理属性值中的转义反斜杠
    .replace(/(\s+[\w-]+=["'])(.*?)["']/g, (_, prefix, value) => {
      return prefix + value.replace(/\\/g, '') + '"';
    })
    // 处理多余的空格
    .replace(/\s+/g, ' ')
    .trim();

  // 3. 提取body内容
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) {
    return new DomTree({ tagName: 'div', attributes: {}, children: [] });
  }

  // 4. 移除不需要的标签和扩展注入的内容
  html = bodyMatch[1]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    // 移除所有媒体相关元素
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<canvas[\s\S]*?<\/canvas>/gi, '')
    .replace(/<video[\s\S]*?<\/video>/gi, '')
    .replace(/<audio[\s\S]*?<\/audio>/gi, '')
    .replace(/<picture[\s\S]*?<\/picture>/gi, '')
    .replace(/<source[^>]*>/gi, '')
    .replace(/<track[^>]*>/gi, '')
    .replace(/<map[\s\S]*?<\/map>/gi, '')
    .replace(/<area[^>]*>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    // 移除扩展注入的内容
    .replace(/<div[^>]*data-extension-[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*extension[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*extension[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*data-testid="[^"]*extension[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // 移除追踪相关的div
    .replace(/<div[^>]*data-tracking-[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*tracking[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*tracking[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*data-testid="[^"]*tracking[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*data-analytics-[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*analytics[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*analytics[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*data-testid="[^"]*analytics[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  // 5. 处理多余的空格和换行
  html = html
    .replace(/>\s+</g, '><') // 移除标签之间的空格
    .replace(/\s+/g, ' ') // 多个空格替换为单个
    .replace(/\s+>/g, '>') // 移除标签前的空格
    .replace(/<\s+/g, '<') // 移除标签后的空格
    .trim();

  const root = parseHtmlString(html);
  return new DomTree(root);
}

function parseHtmlString(html: string): DomNode {
  const stack: DomNode[] = [];
  let currentText = '';
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      if (currentText.trim()) {
        if (stack.length > 0) {
          stack[stack.length - 1].textContent = currentText.trim();
        }
        currentText = '';
      }

      if (html[i + 1] === '/') {
        const endTagMatch = html.slice(i).match(/<\/([^>]+)>/);
        if (endTagMatch) {
          if (stack.length > 1) {
            const node = stack.pop()!;
            stack[stack.length - 1].children.push(node);
          }
          i += endTagMatch[0].length;
        } else {
          i++;
        }
      } else {
        const startTagMatch = html.slice(i).match(/<([^>]+)>/);
        if (startTagMatch) {
          const tagContent = startTagMatch[1];
          const tagName = tagContent.split(' ')[0].toLowerCase();
          const node: DomNode = {
            tagName,
            attributes: {},
            children: [],
          };

          // 改进属性解析逻辑
          const attrRegex = /([\w-]+)(?:=(["'])(.*?)\2)?/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(tagContent)) !== null) {
            const [_, name, _quote, value] = attrMatch;
            if (name === 'id') {
              node.id = value || '';
            }
            // 特殊处理 contenteditable 属性
            if (name === 'contenteditable') {
              node.attributes[name] = value || 'true';
            } else {
              // 对于其他属性，如果值为空，则设置为空字符串而不是 "false"
              node.attributes[name] = value || '';
            }
          }

          stack.push(node);
          i += startTagMatch[0].length;

          if (tagContent.endsWith('/') || isSelfClosingTag(tagName)) {
            if (stack.length > 1) {
              const node = stack.pop()!;
              stack[stack.length - 1].children.push(node);
            }
          }
        } else {
          i++;
        }
      }
    } else {
      currentText += html[i];
      i++;
    }
  }

  if (currentText.trim() && stack.length > 0) {
    stack[stack.length - 1].textContent = currentText.trim();
  }

  return stack[0] || { tagName: 'div', attributes: {}, children: [] };
}

export function minify(domTree: DomTree): {
  html: string;
  selectors: Record<string, string>;
} {
  const minifiedHtml = minifyNode(domTree.root);
  return {
    html: minifiedHtml,
    selectors: domTree.selectors,
  };
}

// 压缩属性值
function compressAttributeValue(value: string): string {
  // 特殊处理 aria-labelledby 属性
  if (value.includes('aria-labelledby')) {
    // 只保留第一个 ID
    const ids = value.split(/\s+/);
    return ids[0];
  }

  return value
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\\/g, '')
    .replace(/&nbsp;/g, ' ');
}

// 压缩文本内容
function compressTextContent(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\\/g, '')
    .replace(/&nbsp;/g, ' ');
}

// 处理通用属性
function processAttributes(attributes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  // 需要移除的无用属性
  const removeAttrs = ['data-at-shortcutkeys', 'class', 'style', 'id'];

  Object.entries(attributes).forEach(([key, value]) => {
    // 移除无用属性
    if (removeAttrs.includes(key)) {
      return;
    }

    // 特殊处理 aria-labelledby 属性
    if (key === 'aria-labelledby') {
      const ids = value.split(/\s+/);
      if (ids[0]) {
        result[key] = ids[0];
      }
      return;
    }

    // 压缩属性值
    const compressedValue = compressAttributeValue(value);
    if (compressedValue) {
      result[key] = compressedValue;
    }
  });

  return result;
}

// 优化嵌套的 div 结构
function optimizeNestedDivs(node: DomNode): DomNode {
  if (node.tagName === 'div' && node.children.length === 1 && node.children[0].tagName === 'div') {
    const child = node.children[0];
    // 合并属性
    Object.entries(child.attributes).forEach(([key, value]) => {
      if (!node.attributes[key]) {
        node.attributes[key] = value;
      }
    });
    // 合并子节点
    node.children = child.children;
    return optimizeNestedDivs(node);
  }
  return node;
}

function simplifyNode(node: DomNode): DomNode | null {
  // 1. 移除所有非核心的标签
  const skipTags = [
    'script',
    'style',
    'link',
    'meta',
    'noscript',
    'iframe',
    'object',
    'embed',
    'svg',
    'canvas',
    'video',
    'audio',
    'picture',
    'source',
    'track',
    'map',
    'area',
    'img',
    'footer',
    'nav', // 添加 nav 到需要移除的标签列表
  ];

  if (skipTags.includes(node.tagName)) {
    return null;
  }

  // 2. 检查是否是输入框或可编辑元素或其父元素
  const isInputOrEditable =
    node.tagName === 'input' ||
    node.tagName === 'textarea' ||
    node.attributes['contenteditable'] === 'true' ||
    node.attributes['role'] === 'textbox' ||
    node.attributes['aria-label']?.includes('text') ||
    node.attributes['aria-label']?.includes('input') ||
    node.attributes['data-testid']?.includes('tweetTextarea') ||
    node.attributes['data-testid']?.includes('tweetTextarea_0') ||
    node.attributes['class']?.includes('DraftEditor') ||
    node.attributes['class']?.includes('public-DraftEditor');

  // 3. 如果是输入框或可编辑元素或其父元素，保留
  if (isInputOrEditable) {
    // 保留必要的样式属性
    if (node.attributes['style']) {
      const importantStyles = [
        'min-height',
        'max-height',
        'overflow',
        'outline',
        'user-select',
        'white-space',
        'overflow-wrap',
        'color',
      ];
      const style = node.attributes['style'];
      const filteredStyle = style
        .split(';')
        .filter(style => importantStyles.some(important => style.includes(important)))
        .join(';');
      if (filteredStyle) {
        node.attributes['style'] = filteredStyle;
      }
    }
    return node;
  }

  // 4. 移除所有隐藏的元素和底部导航
  if (
    node.attributes['aria-hidden'] === 'true' ||
    node.attributes['style']?.includes('display: none') ||
    node.attributes['style']?.includes('visibility: hidden') ||
    node.attributes['aria-label'] === 'Footer' || // 移除底部导航
    node.textContent?.includes('©') || // 移除版权信息
    node.textContent?.includes('Terms of Service') || // 移除服务条款
    node.textContent?.includes('Privacy Policy') || // 移除隐私政策
    node.textContent?.includes('Cookie Policy') || // 移除 Cookie 政策
    node.textContent?.includes('Accessibility') || // 移除可访问性信息
    node.textContent?.includes('Ads info') // 移除广告信息
  ) {
    return null;
  }

  // 3. 处理子节点
  const simplifiedChildren: DomNode[] = [];
  for (const child of node.children) {
    const simplified = simplifyNode(child);
    if (simplified) {
      simplifiedChildren.push(simplified);
    }
  }
  node.children = simplifiedChildren;

  // 4. 检查是否有非空的 span 子节点
  const hasNonEmptySpanChild = (node: DomNode): boolean => {
    if (node.tagName === 'span' && node.textContent?.trim()) {
      return true;
    }
    return node.children.some(child => hasNonEmptySpanChild(child));
  };

  // 5. 检查是否是必要保留的节点
  const hasImportantAttr = Object.keys(node.attributes).some(
    attr =>
      attr.startsWith('aria-') ||
      [
        'href',
        'src',
        'type',
        'name',
        'value',
        'placeholder',
        'alt',
        'title',
        'for',
        'target',
      ].includes(attr)
  );

  const hasContent = node.textContent?.trim();
  const hasChildren = node.children.length > 0;
  const hasNonEmptySpan = hasNonEmptySpanChild(node);

  // 6. 检查是否是特殊空标签
  const isSpecialEmptyTag = [
    'button',
    'span',
    'br',
    'hr',
    'input',
    'textarea',
    'select',
    'option',
    'a',
    'label',
    'i',
    'b',
    'strong',
    'em',
    'small',
    'mark',
    'del',
    'ins',
    'sub',
    'sup',
  ].includes(node.tagName);

  // 7. 如果节点有重要属性、内容、子节点、非空span子节点或是特殊空标签，返回节点
  if (hasImportantAttr || hasContent || hasChildren || hasNonEmptySpan || isSpecialEmptyTag) {
    // 优化嵌套的 div 结构
    node = optimizeNestedDivs(node);
    // 压缩属性
    node.attributes = processAttributes(node.attributes);
    // 压缩文本内容
    if (node.textContent) {
      node.textContent = compressTextContent(node.textContent);
    }
    return node;
  }

  // 8. 检查是否是带有特殊属性的空 div
  if (node.tagName === 'div' && Object.keys(node.attributes).length > 0) {
    // 保留带有任何属性的空 div
    return node;
  }

  // 简化按钮结构
  if (node.tagName === 'button') {
    // 保留按钮的重要属性
    const buttonAttrs = [
      'type',
      'aria-disabled',
      'aria-label',
      'aria-expanded',
      'aria-haspopup',
      'disabled', // 添加 disabled 属性
      'role', // 添加 role 属性
      'tabindex', // 添加 tabindex 属性
      'dir', // 添加 dir 属性
      'data-testid', // 添加 data-testid 到重要属性列表
    ];
    const attrs: Record<string, string> = {};

    // 保留所有重要属性
    Object.entries(node.attributes).forEach(([key, value]) => {
      if (buttonAttrs.includes(key) || key.startsWith('aria-') || key.startsWith('data-')) {
        // 保留所有 data-* 属性
        attrs[key] = value;
      }
    });

    // 获取按钮内的文本内容
    const getButtonText = (n: DomNode): string => {
      if (n.textContent?.trim()) return n.textContent.trim();
      return n.children
        .map(child => getButtonText(child))
        .join(' ')
        .trim();
    };

    const buttonText = getButtonText(node);

    return {
      tagName: 'button',
      attributes: attrs,
      children: [],
      textContent: buttonText,
    };
  }

  // 9. 其他情况返回null
  return null;
}

function minifyNode(node: DomNode): string {
  // 1. 移除所有非核心的标签
  const skipTags = [
    'script',
    'style',
    'link',
    'meta',
    'noscript',
    'iframe',
    'object',
    'embed',
    'svg',
    'canvas',
    'video',
    'audio',
    'picture',
    'source',
    'track',
    'map',
    'area',
    'img',
    'footer',
    'nav',
  ];

  if (skipTags.includes(node.tagName)) {
    return '';
  }

  // 优先处理按钮
  if (node.tagName === 'button') {
    let html = '<button';

    // 添加重要属性
    const buttonAttrs = [
      'type',
      'aria-disabled',
      'aria-label',
      'aria-expanded',
      'aria-haspopup',
      'disabled',
      'role',
      'tabindex',
      'dir',
      'data-testid', // 添加 data-testid 到重要属性列表
    ];

    // 保留所有重要属性
    Object.entries(node.attributes).forEach(([name, value]) => {
      if (buttonAttrs.includes(name) || name.startsWith('aria-') || name.startsWith('data-')) {
        // 保留所有 data-* 属性
        if (value === '') {
          html += ` ${name}`;
        } else {
          html += ` ${name}="${value}"`;
        }
      }
    });

    html += '>';

    // 递归获取所有子节点的文本
    const getButtonText = (n: DomNode): string => {
      if (n.textContent?.trim()) return n.textContent.trim();
      return n.children
        .map(child => getButtonText(child))
        .join(' ')
        .trim();
    };

    const buttonText = getButtonText(node);
    if (buttonText) {
      html += compressTextContent(buttonText);
    }

    html += '</button>';
    return html;
  }

  // 2. 检查是否是输入框或可编辑元素或其父元素
  const isInputOrEditable =
    node.tagName === 'input' ||
    node.tagName === 'textarea' ||
    node.attributes['contenteditable'] === 'true' ||
    node.attributes['role'] === 'textbox' ||
    node.attributes['aria-label']?.includes('text') ||
    node.attributes['aria-label']?.includes('input') ||
    node.attributes['data-testid']?.includes('tweetTextarea') ||
    node.attributes['data-testid']?.includes('tweetTextarea_0') ||
    node.attributes['class']?.includes('DraftEditor') ||
    node.attributes['class']?.includes('public-DraftEditor');

  // 3. 如果是输入框或可编辑元素或其父元素，保留完整结构
  if (isInputOrEditable) {
    let html = `<${node.tagName}`;
    Object.entries(node.attributes).forEach(([name, value]) => {
      if (value) {
        html += ` ${name}="${value}"`;
      }
    });
    html += '>';
    if (node.textContent) {
      html += node.textContent;
    }
    const childHtml = node.children
      .map(child => minifyNode(child))
      .filter(html => html)
      .join('');
    html += childHtml;
    html += `</${node.tagName}>`;
    return html;
  }

  // 4. 移除底部导航和版权信息
  if (
    node.attributes['aria-label'] === 'Footer' ||
    node.textContent?.includes('©') ||
    node.textContent?.includes('Terms of Service') ||
    node.textContent?.includes('Privacy Policy') ||
    node.textContent?.includes('Cookie Policy') ||
    node.textContent?.includes('Accessibility') ||
    node.textContent?.includes('Ads info')
  ) {
    return '';
  }

  // 2. 简化节点
  const processedNode = simplifyNode(node);
  if (!processedNode) {
    return '';
  }

  const childHtml = processedNode.children
    .map(child => minifyNode(child))
    .filter(html => html)
    .join('');

  // 3. 检查是否有重要属性
  const hasImportantAttr = Object.keys(processedNode.attributes).some(
    attr =>
      attr.startsWith('aria-') ||
      [
        'href',
        'src',
        'type',
        'name',
        'value',
        'placeholder',
        'alt',
        'title',
        'for',
        'target',
      ].includes(attr)
  );

  // 4. 检查是否是特殊空标签
  const isSpecialEmptyTag = [
    'button',
    'span',
    'br',
    'hr',
    'input',
    'textarea',
    'select',
    'option',
    'a',
    'label',
    'i',
    'b',
    'strong',
    'em',
    'small',
    'mark',
    'del',
    'ins',
    'sub',
    'sup',
  ].includes(processedNode.tagName);

  // 5. 如果没有重要属性、内容、子节点且不是特殊空标签，返回空字符串
  if (!hasImportantAttr && !processedNode.textContent && !childHtml && !isSpecialEmptyTag) {
    return '';
  }

  let html = `<${processedNode.tagName}`;

  // 6. 只保留重要属性
  Object.entries(processedNode.attributes).forEach(([name, value]) => {
    // 移除无用属性
    if (['data-at-shortcutkeys', 'data-testid', 'class', 'style', 'id'].includes(name)) {
      return;
    }

    // 特殊处理 aria-labelledby 属性
    if (name === 'aria-labelledby') {
      const ids = value.split(/\s+/);
      if (ids[0]) {
        html += ` ${name}="${ids[0]}"`;
      }
      return;
    }

    // 保留 aria-* 属性
    if (name.startsWith('aria-')) {
      const cleanValue = compressAttributeValue(value);
      if (cleanValue) {
        html += ` ${name}="${cleanValue}"`;
      }
      return;
    }

    // 保留其他重要属性
    if (
      [
        'href',
        'src',
        'type',
        'name',
        'value',
        'placeholder',
        'alt',
        'title',
        'for',
        'target',
      ].includes(name)
    ) {
      const cleanValue = compressAttributeValue(value);
      if (cleanValue) {
        html += ` ${name}="${cleanValue}"`;
      }
    }
  });

  html += '>';

  if (processedNode.textContent) {
    const text = compressTextContent(processedNode.textContent);
    if (text) {
      html += text;
    }
  }

  html += childHtml;
  html += `</${processedNode.tagName}>`;
  return html;
}

function isSelfClosingTag(tagName: string): boolean {
  return [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ].includes(tagName);
}
