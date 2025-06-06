// pnpm test -- --testPathPattern=dom-analyzer-v2.test.ts

import {
  DOMAnalyzerV2,
  analyzeDOMV2,
  getClickableElementsString,
  getElementByIndex,
} from '../tools/dom-analyzer-v2';
import { JSDOM } from 'jsdom';

// 设置jsdom环境
beforeAll(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
  global.Element = dom.window.Element;
});

describe('DOMAnalyzerV2', () => {
  const sampleHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
    </head>
    <body>
      <header>
        <nav>
          <a href="/home" id="home-link">Home</a>
          <a href="/about">About</a>
          <button onclick="showMenu()">Menu</button>
        </nav>
      </header>
      
      <main>
        <section class="login-form">
          <h2>Login</h2>
          <form id="login-form" name="loginForm">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" placeholder="Enter username" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" placeholder="Enter password" required>
            
            <input type="checkbox" id="remember" name="remember" checked>
            <label for="remember">Remember me</label>
            
            <button type="submit" aria-label="Submit login form">Login</button>
            <button type="button" disabled>Reset</button>
          </form>
        </section>
        
        <section class="content">
          <div class="container">
            <select id="category" name="category">
              <option value="all">All Categories</option>
              <option value="tech" selected>Technology</option>
              <option value="news">News</option>
            </select>
            
            <div style="cursor: pointer" onclick="handleClick()">Clickable Div</div>
            <div style="display: none">Hidden Element</div>
            
            <textarea id="comments" placeholder="Enter your comments"></textarea>
            
            <span role="button" tabindex="0">Custom Button</span>
          </div>
        </section>
      </main>
      
      <footer>
        <p>© 2024 Test Site</p>
      </footer>
    </body>
    </html>
  `;

  let analyzer: DOMAnalyzerV2;

  beforeEach(() => {
    analyzer = new DOMAnalyzerV2(sampleHTML);
  });

  describe('Core Functionality', () => {
    test('should extract semantic segments with friendly output', () => {
      console.debug('🧪 Testing semantic segment extraction...');
      const result = analyzer.analyze();

      expect(result.segments).toBeDefined();
      expect(result.segments.length).toBeGreaterThan(0);

      // Check for semantic elements
      const segmentTypes = result.segments.map(s => s.type);
      expect(segmentTypes).toContain('header');
      expect(segmentTypes).toContain('nav');
      expect(segmentTypes).toContain('main');
      expect(segmentTypes).toContain('footer');

      console.debug('✅ Semantic segments test passed!');
    });

    test('should assign highlight indices to interactive elements', () => {
      const result = analyzer.analyze();

      expect(result.highlightedElements).toBeDefined();
      expect(result.highlightedElements.length).toBeGreaterThan(0);

      // Check that each element has a unique highlight_index
      const indices = result.highlightedElements.map(el => el.highlight_index);
      const uniqueIndices = new Set(indices);
      expect(indices.length).toBe(uniqueIndices.size);

      // Check that indices start from 0 and are sequential
      expect(Math.min(...indices)).toBe(0);
      expect(Math.max(...indices)).toBe(indices.length - 1);
    });

    test('should create element mapping', () => {
      const result = analyzer.analyze();

      expect(result.elementMap).toBeDefined();
      expect(result.elementMap.size).toBe(result.highlightedElements.length);

      // Verify each highlighted element is in the map
      result.highlightedElements.forEach(element => {
        expect(result.elementMap.has(element.highlight_index)).toBe(true);
        const mappedElement = result.elementMap.get(element.highlight_index);
        expect(mappedElement).toBeDefined();
        expect(mappedElement!.element).toBe(element.element);
      });
    });

    test('should generate clickable elements string', () => {
      const result = analyzer.analyze();

      expect(result.clickableElementsString).toBeDefined();
      expect(result.clickableElementsString.length).toBeGreaterThan(0);

      // Check format: [index]<type>text</type>
      const lines = result.clickableElementsString.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(result.highlightedElements.length);

      lines.forEach((line, index) => {
        expect(line).toMatch(/^\[\d+\]<\w+.*>.*<\/\w+>$/);
        expect(line).toContain(`[${index}]`);
      });
    });
  });

  describe('Element Detection', () => {
    test('should detect different types of interactive elements', () => {
      const result = analyzer.analyze();

      const tagNames = result.highlightedElements.map(el => el.tagName);

      expect(tagNames).toContain('a');
      expect(tagNames).toContain('button');
      expect(tagNames).toContain('input');
      expect(tagNames).toContain('select');
      expect(tagNames).toContain('textarea');
      expect(tagNames).toContain('span'); // role="button"
      expect(tagNames).toContain('div'); // cursor: pointer
    });

    test('should extract element attributes correctly', () => {
      const result = analyzer.analyze();

      // Find username input
      const usernameInput = result.highlightedElements.find(el => el.id === 'username');
      expect(usernameInput).toBeDefined();
      expect(usernameInput!.type).toBe('input[type="text"]');
      expect(usernameInput!.placeholder).toBe('Enter username');
      expect(usernameInput!.required).toBe(true);
      expect(usernameInput!.interactionType).toBe('input');

      // Find submit button
      const submitButton = result.highlightedElements.find(
        el => el.tagName === 'button' && el.attributes.type === 'submit'
      );
      expect(submitButton).toBeDefined();
      expect(submitButton!.ariaLabel).toBe('Submit login form');
      expect(submitButton!.interactionType).toBe('submit');

      // Find disabled button
      const disabledButton = result.highlightedElements.find(el => el.disabled === true);
      expect(disabledButton).toBeDefined();

      // Find checked checkbox
      const checkbox = result.highlightedElements.find(el => el.id === 'remember');
      expect(checkbox).toBeDefined();
      expect(checkbox!.checked).toBe(true);
    });

    test('should associate labels with form elements', () => {
      const result = analyzer.analyze();

      const usernameInput = result.highlightedElements.find(el => el.id === 'username');
      expect(usernameInput).toBeDefined();
      expect(usernameInput!.labelText).toBe('Username:');
      expect(usernameInput!.associatedLabels).toContain('Username:');
    });

    test('should detect form context', () => {
      const result = analyzer.analyze();

      const formElements = result.highlightedElements.filter(el => el.formId || el.formName);

      expect(formElements.length).toBeGreaterThan(0);

      const usernameInput = result.highlightedElements.find(el => el.id === 'username');
      expect(usernameInput!.formId).toBe('login-form');
      expect(usernameInput!.formName).toBe('loginForm');
    });

    test('should skip hidden elements', () => {
      const result = analyzer.analyze();

      // Should not include the hidden div
      const hiddenElements = result.highlightedElements.filter(el => el.hidden === true);
      expect(hiddenElements.length).toBe(0);
    });
  });

  describe('String Representation', () => {
    test('should format clickable elements correctly', () => {
      const result = analyzer.analyze();

      const clickableString = result.clickableElementsString;

      // Check specific elements
      expect(clickableString).toContain('<a href="/home">Home</a>');
      expect(clickableString).toContain(
        '<button aria-label="Submit login form">Submit login form</button>'
      );
      expect(clickableString).toContain(
        '<input placeholder="Enter username" type="text" required>Username:</input>'
      );
      expect(clickableString).toContain('<span>Custom Button</span>');
    });

    test('should handle long text truncation', () => {
      const longHTML = `
        <button>This is a very long button text that should be truncated because it exceeds the 50 character limit</button>
      `;

      const longAnalyzer = new DOMAnalyzerV2(longHTML);
      const result = longAnalyzer.analyze();

      const buttonElement = result.highlightedElements.find(el => el.tagName === 'button');
      expect(buttonElement).toBeDefined();

      const formatted = longAnalyzer.clickable_elements_to_string([buttonElement!]);
      expect(formatted).toContain('...');
      expect(formatted.split('>')[1].split('<')[0].length).toBeLessThanOrEqual(50);
    });

    test('should include important attributes', () => {
      const result = analyzer.analyze();
      const clickableString = result.clickableElementsString;

      // Should include type for inputs
      expect(clickableString).toContain('type="text"');
      expect(clickableString).toContain('type="password"');

      // Should include href for links
      expect(clickableString).toContain('href="/home"');

      // Should include disabled for disabled elements
      expect(clickableString).toContain('disabled');

      // Should include required for required elements
      expect(clickableString).toContain('required');
    });
  });

  describe('Utility Functions', () => {
    test('analyzeDOMV2 factory function should work', () => {
      const result = analyzeDOMV2(sampleHTML);

      expect(result).toBeDefined();
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.highlightedElements.length).toBeGreaterThan(0);
      expect(result.clickableElementsString.length).toBeGreaterThan(0);
    });

    test('getClickableElementsString utility should work', () => {
      const clickableString = getClickableElementsString(sampleHTML);

      expect(clickableString).toBeDefined();
      expect(clickableString.length).toBeGreaterThan(0);
      expect(clickableString).toContain('[0]');
    });

    test('getElementByIndex utility should work', () => {
      const result = analyzeDOMV2(sampleHTML);
      const firstElementIndex = result.highlightedElements[0].highlight_index;

      const element = getElementByIndex(sampleHTML, firstElementIndex);

      expect(element).toBeDefined();
      // Use more flexible comparison since JSDOM elements might not be strictly equal
      expect(element!.tagName).toBe(result.highlightedElements[0].tagName);
      expect(element!.selector).toBe(result.highlightedElements[0].selector);
      expect(element!.id).toBe(result.highlightedElements[0].id);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty HTML', () => {
      console.debug('🧪 Testing empty HTML handling...');
      const emptyAnalyzer = new DOMAnalyzerV2('<html><body></body></html>');
      const result = emptyAnalyzer.analyze();

      expect(result.highlightedElements.length).toBe(0);
      expect(result.clickableElementsString).toBe('');
      expect(result.elementMap.size).toBe(0);
      console.debug('✅ Empty HTML test passed!');
    });

    test('should handle HTML without semantic elements', () => {
      const nonSemanticHTML = `
        <html>
          <body>
            <div class="container">
              <div class="content">
                <button>Click me</button>
                <input type="text" placeholder="Type here">
              </div>
            </div>
          </body>
        </html>
      `;

      const analyzer = new DOMAnalyzerV2(nonSemanticHTML);
      const result = analyzer.analyze();

      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.segments[0].type).toBe('container');
      expect(result.highlightedElements.length).toBe(2); // button and input
    });

    test('should handle elements with no text content', () => {
      const noTextHTML = `
        <html>
          <body>
            <button></button>
            <input type="submit" value="">
            <a href="/test"></a>
          </body>
        </html>
      `;

      const analyzer = new DOMAnalyzerV2(noTextHTML);
      const result = analyzer.analyze();

      expect(result.highlightedElements.length).toBe(3);
      expect(result.clickableElementsString).toBeDefined();
    });
  });

  // pnpm test -- --testPathPattern=dom-analyzer-v2.test.ts --testNamePattern="friendly output demo"
  describe('🎭 Friendly Output Demo', () => {
    test('should demonstrate comprehensive analysis with friendly output', () => {
      console.debug('\n🎬 Starting comprehensive DOM analysis demonstration...');
      console.debug('═══════════════════════════════════════════════════════════');

      const demoHTML = `
        <!DOCTYPE html>
        <html>
        <head><title>E-commerce Demo</title></head>
        <body>
          <header>
            <nav>
              <a href="/">🏠 Home</a>
              <a href="/shop">🛍️ Shop</a>
              <a href="/cart">🛒 Cart</a>
              <button onclick="toggleMenu()">☰ Menu</button>
            </nav>
          </header>
          
          <main>
            <section class="hero">
              <h1>Welcome to Our Store!</h1>
              <button class="cta-button">Shop Now 🚀</button>
            </section>
            
            <section class="products">
              <div class="product-card">
                <button onclick="addToCart(1)">Add to Cart 🛒</button>
                <input type="number" value="1" min="1" placeholder="Quantity">
              </div>
            </section>
            
            <section class="newsletter">
              <form id="newsletter-form">
                <label for="email">📧 Email:</label>
                <input type="email" id="email" required placeholder="your@email.com">
                <input type="checkbox" id="terms" required>
                <label for="terms">I agree to terms</label>
                <button type="submit" disabled>Subscribe ✨</button>
              </form>
            </section>
          </main>
          
          <footer>
            <div class="social-links">
              <a href="/facebook">📘 Facebook</a>
              <a href="/twitter">🐦 Twitter</a>
            </div>
          </footer>
        </body>
        </html>
      `;

      const demoAnalyzer = new DOMAnalyzerV2(demoHTML);
      const result = demoAnalyzer.analyze();

      // Verify the analysis worked
      expect(result.segments.length).toBeGreaterThan(0);
      expect(result.highlightedElements.length).toBeGreaterThan(0);
      expect(result.clickableElementsString.length).toBeGreaterThan(0);

      // Show the AI-friendly string output
      console.debug('\n🤖 AI-Friendly String Representation:');
      console.debug('───────────────────────────────────────');
      console.debug(result.clickableElementsString);
      console.debug('───────────────────────────────────────');

      console.debug('\n🎯 Element Highlight Index Mapping:');
      result.highlightedElements.forEach((el, _) => {
        console.debug(
          `  [${el.highlight_index}] ${el.tagName}${el.id ? `#${el.id}` : ''} → ${el.interactionType}`
        );
      });

      console.debug('\n✨ Demo completed successfully!');
      console.debug('═══════════════════════════════════════════════════════════\n');
    });
  });
});
