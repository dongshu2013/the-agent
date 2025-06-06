// pnpm test -- --testPathPattern=dom-analyzer.test.ts

import { segmentHtmlContent, PageSegment } from '../tools/dom-analyzer';
import { JSDOM } from 'jsdom';

// 设置jsdom环境
beforeAll(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
  global.Element = dom.window.Element;
});

// 辅助函数：格式化输出PageSegment对象
function formatSegment(segment: PageSegment, index: number): string {
  let result = `段落 ${index + 1}:\n`;
  result += `- 类型: ${segment.type}\n`;
  result += `- 选择器: ${segment.selector}\n`;
  result += `- 交互元素数量: ${segment.interactiveElements.length}\n`;

  // 输出交互元素的简要信息
  if (segment.interactiveElements.length > 0) {
    result += '- 交互元素:\n';
    segment.interactiveElements.forEach((element, idx) => {
      result += `  ${idx + 1}. ${element.tagName}${element.type ? `[${element.type}]` : ''} - ${element.selector.substring(0, 50)}${element.selector.length > 50 ? '...' : ''}\n`;
    });
  }

  // 输出文本内容的前50个字符
  result += `- 文本内容: ${segment.textContent?.substring(0, 50)}${segment.textContent && segment.textContent.length > 50 ? '...' : ''}\n`;

  return result;
}

describe('DOM Analyzer Tests', () => {
  describe('segmentHtmlContent', () => {
    // 测试用例1：包含语义化HTML元素的页面
    const htmlWithSemanticElements = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>测试页面</title>
      </head>
      <body>
        <header>
          <h1>网站标题</h1>
          <nav>
            <ul>
              <li><a href="#">首页</a></li>
              <li><a href="#">关于</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <section>
            <h2>主要内容</h2>
            <p>这是一些文本内容</p>
            <button>点击我</button>
            <input type="text" placeholder="输入文本">
          </section>
          <aside>
            <h3>侧边栏</h3>
            <ul>
              <li>项目1</li>
              <li>项目2</li>
            </ul>
          </aside>
        </main>
        <footer>
          <p>版权信息</p>
        </footer>
      </body>
      </html>
    `;

    // 测试用例2：没有语义化元素的页面
    const htmlWithoutSemanticElements = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>测试页面</title>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>网站标题</h1>
            <div class="nav">
              <ul>
                <li><a href="#">首页</a></li>
                <li><a href="#">关于</a></li>
              </ul>
            </div>
          </div>
          <div class="content">
            <div class="main-content">
              <h2>主要内容</h2>
              <p>这是一些文本内容</p>
              <button>点击我</button>
              <input type="text" placeholder="输入文本">
            </div>
            <div class="sidebar">
              <h3>侧边栏</h3>
              <ul>
                <li>项目1</li>
                <li>项目2</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>版权信息</p>
          </div>
        </div>
      </body>
      </html>
    `;

    test('应该正确分析包含语义化HTML元素的页面', () => {
      const semanticSegments = segmentHtmlContent(htmlWithSemanticElements);

      // 输出分析结果
      console.log('\n语义化HTML元素分析结果:');
      console.log(`找到 ${semanticSegments.length} 个语义化段落:`);
      semanticSegments.forEach((segment, index) => {
        console.log(formatSegment(segment, index));
      });

      // 验证基本结果
      expect(semanticSegments).toBeDefined();
      expect(Array.isArray(semanticSegments)).toBe(true);
      expect(semanticSegments.length).toBeGreaterThan(0);

      // 验证找到了语义化元素
      const segmentTypes = semanticSegments.map(segment => segment.type);
      expect(segmentTypes).toContain('header');
      expect(segmentTypes).toContain('main');
      expect(segmentTypes).toContain('footer');

      // 验证交互元素被正确提取
      const mainSegment = semanticSegments.find(segment => segment.type === 'main');
      expect(mainSegment).toBeDefined();
      if (mainSegment) {
        expect(mainSegment.interactiveElements.length).toBeGreaterThan(0);
      }
    });

    test('应该正确分析没有语义化元素的页面', () => {
      const nonSemanticSegments = segmentHtmlContent(htmlWithoutSemanticElements);

      // 输出分析结果
      console.log('\n非语义化HTML元素分析结果:');
      console.log(`找到 ${nonSemanticSegments.length} 个非语义化段落:`);
      nonSemanticSegments.forEach((segment, index) => {
        console.log(formatSegment(segment, index));
      });

      // 验证基本结果
      expect(nonSemanticSegments).toBeDefined();
      expect(Array.isArray(nonSemanticSegments)).toBe(true);
      expect(nonSemanticSegments.length).toBeGreaterThan(0);

      // 验证找到了容器元素
      const containerSegments = nonSemanticSegments.filter(segment => segment.type === 'container');
      expect(containerSegments.length).toBeGreaterThan(0);

      // 验证交互元素被正确提取
      const totalInteractiveElements = nonSemanticSegments.reduce(
        (total, segment) => total + segment.interactiveElements.length,
        0
      );
      expect(totalInteractiveElements).toBeGreaterThan(0);
    });
  });
});
