export interface DomNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DomNode[];
  textContent?: string;
  id?: string;
  classList?: string[];
}

export class DomTree {
  root: DomNode;
  selectors: Record<string, string>;

  constructor(root: DomNode) {
    this.root = root;
    this.selectors = {};
  }

  addSelector(selector: string, path: string) {
    this.selectors[selector] = path;
  }
}

export function parseHtml(html: string): DomTree {
  // 移除注释
  html = html.replace(/<!--[\s\S]*?-->/g, "");

  // 处理转义字符
  html = html
    .replace(/\\"/g, '"')
    .replace(/\\&quot;/g, '"')
    .replace(/\\&amp;/g, "&")
    .replace(/\\&lt;/g, "<")
    .replace(/\\&gt;/g, ">");

  // 解析HTML
  const root = parseHtmlString(html);
  return new DomTree(root);
}

function parseHtmlString(html: string): DomNode {
  const stack: DomNode[] = [];
  let currentText = "";
  let i = 0;

  while (i < html.length) {
    if (html[i] === "<") {
      // 处理文本节点
      if (currentText.trim()) {
        if (stack.length > 0) {
          stack[stack.length - 1].textContent = currentText.trim();
        }
        currentText = "";
      }

      // 处理标签
      if (html[i + 1] === "/") {
        // 结束标签
        const endTagMatch = html.slice(i).match(/<\/([^>]+)>/);
        if (endTagMatch) {
          const tagName = endTagMatch[1].toLowerCase();
          if (stack.length > 1) {
            const node = stack.pop()!;
            stack[stack.length - 1].children.push(node);
          }
          i += endTagMatch[0].length;
        } else {
          i++;
        }
      } else {
        // 开始标签
        const startTagMatch = html.slice(i).match(/<([^>]+)>/);
        if (startTagMatch) {
          const tagContent = startTagMatch[1];
          const tagName = tagContent.split(" ")[0].toLowerCase();
          const node: DomNode = {
            tagName,
            attributes: {},
            children: [],
          };

          // 解析属性
          const attrRegex = /(\w+)=["']([^"']*)["']/g;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(tagContent)) !== null) {
            const [_, name, value] = attrMatch;
            node.attributes[name] = value;
            if (name === "id") node.id = value;
            if (name === "class") node.classList = value.split(" ");
          }

          stack.push(node);
          i += startTagMatch[0].length;

          // 处理自闭合标签
          if (tagContent.endsWith("/") || isSelfClosingTag(tagName)) {
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

  // 处理最后的文本节点
  if (currentText.trim() && stack.length > 0) {
    stack[stack.length - 1].textContent = currentText.trim();
  }

  return stack[0] || { tagName: "div", attributes: {}, children: [] };
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

function minifyNode(node: DomNode): string {
  let html = `<${node.tagName}`;

  // 添加属性
  Object.entries(node.attributes).forEach(([name, value]) => {
    html += ` ${name}="${value}"`;
  });

  // 如果是自闭合标签，直接返回
  if (isSelfClosingTag(node.tagName)) {
    return html + " />";
  }

  html += ">";

  // 添加文本内容
  if (node.textContent) {
    html += node.textContent;
  }

  // 添加子节点
  node.children.forEach((child) => {
    html += minifyNode(child);
  });

  html += `</${node.tagName}>`;
  return html;
}

function isSelfClosingTag(tagName: string): boolean {
  const selfClosingTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];
  return selfClosingTags.includes(tagName);
}
