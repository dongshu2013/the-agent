/**
 * Integration tests for DOM Analyzer V2 with WebToolkit
 * Tests Goal 2 implementation: Better AI understanding and operation of webpages
 */

import { WebToolkit } from '../tools/web-toolkit';
import { analyzeDOMV2, DOMAnalyzerV2 } from '../tools/dom-analyzer-v2';
import { PerformanceComparator } from '../tools/performance-comparison';

describe('DOM Analyzer V2 Integration Tests', () => {
  let webToolkit: WebToolkit;
  let performanceComparator: PerformanceComparator;

  beforeEach(() => {
    webToolkit = new WebToolkit();
    performanceComparator = new PerformanceComparator();
    jest.clearAllMocks();
  });

  describe('analyzeDOMV2 Method', () => {
    const mockHtmlContent = `
      <!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <header>
            <nav>
              <a href="/home">Home</a>
              <a href="/about">About</a>
            </nav>
          </header>
          <main>
            <section>
              <h1>Welcome</h1>
              <form id="loginForm">
                <label for="username">Username:</label>
                <input type="text" id="username" placeholder="Enter username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" placeholder="Enter password" required>
                <button type="submit" aria-label="Submit login form">Login</button>
              </form>
            </section>
            <aside>
              <button onclick="showHelp()">Help</button>
              <div role="button" tabindex="0">Custom Button</div>
            </aside>
          </main>
          <footer>
            <p>© 2024 Test Company</p>
          </footer>
        </body>
      </html>
    `;

    it('should successfully analyze DOM structure', async () => {
      // Mock the executeInTab method
      (webToolkit as any).executeInTab = jest.fn().mockResolvedValue({
        html: mockHtmlContent,
        url: 'https://example.com',
        title: 'Test Page',
        pageSize: mockHtmlContent.length,
      });

      const result = await webToolkit.analyzeDOMV2();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeDefined();
        expect(result.data.analysis).toBeDefined();
        expect(result.data.performance).toBeDefined();
      }
    });

    it('should detect semantic segments correctly', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      expect(analysis.segments).toBeDefined();
      expect(analysis.segments.length).toBeGreaterThan(0);

      // Check for expected semantic segments
      const segmentTypes = analysis.segments.map(s => s.type);
      expect(segmentTypes).toContain('header');
      expect(segmentTypes).toContain('nav');
      expect(segmentTypes).toContain('main');
      expect(segmentTypes).toContain('section');
      expect(segmentTypes).toContain('aside');
      expect(segmentTypes).toContain('footer');
    });

    it('should assign highlight indices to interactive elements', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      expect(analysis.highlightedElements).toBeDefined();
      expect(analysis.highlightedElements.length).toBeGreaterThan(0);

      // Check highlight indices are sequential and start from 0
      const indices = analysis.highlightedElements.map(el => el.highlight_index);
      expect(indices).toEqual(expect.arrayContaining([0, 1, 2, 3, 4, 5, 6]));
    });

    it('should create element mapping correctly', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      expect(analysis.elementMap).toBeDefined();
      expect(analysis.elementMap.size).toBe(analysis.totalElements);

      // Test mapping functionality
      for (const element of analysis.highlightedElements) {
        const mappedElement = analysis.elementMap.get(element.highlight_index);
        expect(mappedElement).toBeDefined();
        expect(mappedElement!.tagName).toBe(element.tagName);
      }
    });

    it('should generate AI-friendly string representation', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      expect(analysis.clickableElementsString).toBeDefined();
      expect(analysis.clickableElementsString.length).toBeGreaterThan(0);

      // Check format: [index]<type>text</type>
      const lines = analysis.clickableElementsString.split('\n');
      expect(lines.length).toBeGreaterThan(0);

      // Test first few elements format
      expect(lines[0]).toMatch(/^\[\d+\]<\w+.*>.*<\/\w+>$/);
      expect(lines[1]).toMatch(/^\[\d+\]<\w+.*>.*<\/\w+>$/);
    });

    it('should handle form context and labels', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      // Find form inputs
      const usernameInput = analysis.highlightedElements.find(
        el => el.attributes.id === 'username'
      );
      const submitButton = analysis.highlightedElements.find(el => el.attributes.type === 'submit');

      expect(usernameInput).toBeDefined();
      expect(usernameInput!.formId).toBe('loginForm');
      expect(usernameInput!.labelText).toContain('Username');

      expect(submitButton).toBeDefined();
      expect(submitButton!.formId).toBe('loginForm');
    });

    it('should identify interaction types correctly', async () => {
      const analysis = analyzeDOMV2(mockHtmlContent);

      const linkElement = analysis.highlightedElements.find(
        el => el.tagName === 'a' && el.attributes.href
      );
      const inputElement = analysis.highlightedElements.find(el => el.tagName === 'input');
      const buttonElement = analysis.highlightedElements.find(el => el.tagName === 'button');

      expect(linkElement!.interactionType).toBe('navigate');
      expect(inputElement!.interactionType).toBe('input');
      expect(buttonElement!.interactionType).toBe('submit');
    });
  });

  describe('clickElementByIndex Method', () => {
    it('should click element by highlight index', async () => {
      const mockAnalysisResult = {
        success: true,
        data: {
          analysis: {
            elementMap: new Map([
              [0, { selector: '#testButton', tagName: 'button' }],
              [1, { selector: '#testInput', tagName: 'input' }],
            ]),
          },
          performance: {},
        },
      };

      // Mock analyzeDOMV2 method
      webToolkit.analyzeDOMV2 = jest.fn().mockResolvedValue(mockAnalysisResult);

      // Mock clickElement method
      webToolkit.clickElement = jest.fn().mockResolvedValue({
        success: true,
        data: { clicked: true, elementStillExists: true },
      });

      const result = await webToolkit.clickElementByIndex(0);

      expect(result.success).toBe(true);
      expect(webToolkit.clickElement).toHaveBeenCalledWith('#testButton');
    });

    it('should handle invalid highlight index', async () => {
      const mockAnalysisResult = {
        success: true,
        data: {
          analysis: {
            elementMap: new Map([[0, { selector: '#testButton', tagName: 'button' }]]),
          },
          performance: {},
        },
      };

      webToolkit.analyzeDOMV2 = jest.fn().mockResolvedValue(mockAnalysisResult);

      const result = await webToolkit.clickElementByIndex(999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Element with highlight index 999 not found');
      }
    });
  });

  // npm test -- --testNamePattern="Performance Comparison"
  describe('Performance Comparison', () => {
    it('should measure performance metrics correctly', async () => {
      // Mock the webToolkit methods on the performanceComparator instance
      const mockWebToolkit = performanceComparator['webToolkit'];
      mockWebToolkit.listElements = jest.fn().mockResolvedValue({
        success: true,
        data: {
          elements: [
            { text: 'Button 1', type: 'button' },
            { text: 'Button 2', type: 'button' },
          ],
        },
      });

      mockWebToolkit.analyzeDOMV2 = jest.fn().mockResolvedValue({
        success: true,
        data: {
          analysis: {
            totalElements: 5,
            clickableElementsString: '[0]<button>Button 1</button>\n[1]<button>Button 2</button>',
            segments: [],
            highlightedElements: [],
            elementMap: new Map(),
          },
          performance: {
            analysisTime: 50,
            totalElements: 5,
            pageSize: 1000,
            stringLength: 55,
          },
        },
      });

      const result = await performanceComparator.comparePerformance();

      // Output detailed performance comparison results
      console.debug('\n🎯 PERFORMANCE COMPARISON TEST RESULTS:');
      console.debug('═══════════════════════════════════════════════════════════');

      console.debug('\n📊 listElements Metrics:');
      console.debug(`  🕐 Execution Time: ${result.listElementsMetrics.executionTime}ms`);
      console.debug(`  🔢 Element Count: ${result.listElementsMetrics.elementCount}`);
      console.debug(`  📦 Output Size: ${result.listElementsMetrics.outputSize} bytes`);
      console.debug(`  🤖 AI Readability: ${result.listElementsMetrics.aiReadabilityScore}/100`);

      console.debug('\n📊 analyzeDOMV2 Metrics:');
      console.debug(`  🕐 Execution Time: ${result.analyzeDOMV2Metrics.executionTime}ms`);
      console.debug(`  🔢 Element Count: ${result.analyzeDOMV2Metrics.elementCount}`);
      console.debug(`  📦 Output Size: ${result.analyzeDOMV2Metrics.outputSize} bytes`);
      console.debug(`  🤖 AI Readability: ${result.analyzeDOMV2Metrics.aiReadabilityScore}/100`);
      console.debug(
        `  🗜️ Compression Ratio: ${result.analyzeDOMV2Metrics.compressionRatio?.toFixed(1)}%`
      );

      console.debug('\n📈 Improvements:');
      console.debug(
        `  ⚡ Speed: ${result.improvement.speedImprovement > 0 ? '+' : ''}${result.improvement.speedImprovement.toFixed(1)}%`
      );
      console.debug(`  📦 Size Reduction: ${result.improvement.sizeReduction.toFixed(1)}%`);
      console.debug(
        `  🎯 Element Count Increase: ${result.improvement.elementCountIncrease > 0 ? '+' : ''}${result.improvement.elementCountIncrease.toFixed(1)}%`
      );
      console.debug(
        `  🤖 AI Readability Improvement: ${result.improvement.aiReadabilityImprovement > 0 ? '+' : ''}${result.improvement.aiReadabilityImprovement.toFixed(1)}%`
      );

      console.debug('\n💡 Recommendation:');
      console.debug(`  ${result.recommendation}`);

      console.debug('\n📋 Summary:');
      console.debug(`  ${result.summary}`);

      console.debug('\n═══════════════════════════════════════════════════════════\n');

      expect(result).toBeDefined();
      expect(result.listElementsMetrics).toBeDefined();
      expect(result.analyzeDOMV2Metrics).toBeDefined();
      expect(result.improvement).toBeDefined();
      expect(result.recommendation).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should calculate improvements correctly', async () => {
      // Mock the webToolkit methods on the performanceComparator instance
      const mockWebToolkit = performanceComparator['webToolkit'];
      mockWebToolkit.listElements = jest.fn().mockResolvedValue({
        success: true,
        data: {
          elements: Array(10).fill({ text: 'Sample', type: 'button' }),
        },
      });

      mockWebToolkit.analyzeDOMV2 = jest.fn().mockResolvedValue({
        success: true,
        data: {
          analysis: {
            totalElements: 15,
            clickableElementsString: 'Short AI string',
            segments: [],
            highlightedElements: [],
            elementMap: new Map(),
          },
          performance: {
            analysisTime: 30,
            totalElements: 15,
            pageSize: 2000,
            stringLength: 17,
          },
        },
      });

      const result = await performanceComparator.comparePerformance();

      // Output improvement calculations test results
      console.debug('\n🧮 IMPROVEMENT CALCULATIONS TEST:');
      console.debug('═══════════════════════════════════════════════════════════');
      console.debug('\n📊 Mock Data Setup:');
      console.debug('  📝 listElements: 10 elements');
      console.debug('  🔍 analyzeDOMV2: 15 elements');
      console.debug('  📈 Expected element increase: +50%');
      console.debug('  📦 Expected significant size reduction');

      console.debug('\n📈 Calculated Improvements:');
      console.debug(
        `  🎯 Element Count Increase: ${result.improvement.elementCountIncrease.toFixed(1)}%`
      );
      console.debug(`  📦 Size Reduction: ${result.improvement.sizeReduction.toFixed(1)}%`);
      console.debug(`  ⚡ Speed Improvement: ${result.improvement.speedImprovement.toFixed(1)}%`);
      console.debug(
        `  🤖 AI Readability Improvement: ${result.improvement.aiReadabilityImprovement.toFixed(1)}%`
      );

      console.debug('\n✅ Test Validation:');
      console.debug(
        `  Element count increase > 0: ${result.improvement.elementCountIncrease > 0 ? '✅' : '❌'}`
      );
      console.debug(`  Size reduction > 0: ${result.improvement.sizeReduction > 0 ? '✅' : '❌'}`);
      console.debug('\n═══════════════════════════════════════════════════════════\n');

      expect(result.improvement.elementCountIncrease).toBeGreaterThan(0);
      expect(result.improvement.sizeReduction).toBeGreaterThan(0);
    });

    it('should generate detailed comparison report', async () => {
      // Setup realistic performance comparison data
      const mockWebToolkit = performanceComparator['webToolkit'];

      // Mock listElements with verbose traditional output
      mockWebToolkit.listElements = jest.fn().mockResolvedValue({
        success: true,
        data: {
          elements: [
            {
              uniqueSelector: 'button.btn.btn-primary.submit-form',
              selectorPath: 'button.btn.btn-primary.submit-form',
              text: 'Submit Form',
              type: 'button',
              attributes: {
                class: 'btn btn-primary submit-form',
                type: 'submit',
                'aria-label': 'Submit the login form',
              },
              isVisible: true,
              isInteractive: true,
              elementState: {
                isEnabled: true,
                tagName: 'button',
                className: 'btn btn-primary submit-form',
                id: '',
                role: undefined,
                ariaLabel: 'Submit the login form',
                dataTestId: undefined,
              },
            },
            {
              uniqueSelector: 'input#username.form-control',
              selectorPath: 'input#username.form-control',
              text: '',
              type: 'input',
              attributes: {
                id: 'username',
                class: 'form-control',
                type: 'text',
                placeholder: 'Enter your username',
              },
              isVisible: true,
              isInteractive: true,
              elementState: {
                isEnabled: true,
                tagName: 'input',
                className: 'form-control',
                id: 'username',
                role: undefined,
                ariaLabel: undefined,
                dataTestId: undefined,
              },
            },
          ],
        },
      });

      // Mock analyzeDOMV2 with optimized output
      mockWebToolkit.analyzeDOMV2 = jest.fn().mockResolvedValue({
        success: true,
        data: {
          analysis: {
            totalElements: 25,
            clickableElementsString:
              '[0]<a href="/home">Home</a>\n' +
              '[1]<a href="/about">About</a>\n' +
              '[2]<input type="text" placeholder="Enter your username" required>Enter your username</input>\n' +
              '[3]<input type="password" placeholder="Enter your password" required>Enter your password</input>\n' +
              '[4]<button type="submit" aria-label="Submit the login form">Submit Form</button>\n' +
              '[5]<button onclick="showHelp()">Help</button>\n' +
              '[6]<div role="button" tabindex="0">Custom Button</div>',
            segments: [
              { type: 'header', elements: 2 },
              { type: 'nav', elements: 3 },
              { type: 'main', elements: 15 },
              { type: 'footer', elements: 5 },
            ],
            highlightedElements: [],
            elementMap: new Map(),
          },
          performance: {
            analysisTime: 45,
            totalElements: 25,
            pageSize: 8500,
            stringLength: 425,
          },
        },
      });

      console.debug('\n🚀 FULL PERFORMANCE COMPARISON DEMONSTRATION:');
      console.debug('═══════════════════════════════════════════════════════════');

      // Run the comparison and show the complete report
      await performanceComparator.printComparisonReport();

      console.debug('✅ Performance comparison report generated successfully!');
      console.debug('═══════════════════════════════════════════════════════════\n');

      // Verify the results are calculated correctly
      const result = await performanceComparator.comparePerformance();
      expect(result.improvement.sizeReduction).toBeGreaterThan(40); // Expect significant size reduction (actual: ~46%)
      expect(result.improvement.elementCountIncrease).toBeGreaterThan(1000); // 25 vs 2 elements = 1150% increase
      expect(result.improvement.aiReadabilityImprovement).toBeGreaterThan(20); // Expect significant AI readability improvement (actual: 25%)
    });
  });

  describe('Integration with Browser-Use Patterns', () => {
    it('should generate browser-use compatible format', async () => {
      const analysis = analyzeDOMV2(`
        <html>
          <body>
            <button id="submit">Submit Form</button>
            <input type="text" placeholder="Enter text">
            <a href="/page">Go to Page</a>
          </body>
        </html>
      `);

      const format = analysis.clickableElementsString;
      const lines = format.split('\n');

      // Check browser-use format: [index]<type>text</type>
      expect(lines[0]).toMatch(/^\[0\]<button.*>.*<\/button>$/);
      expect(lines[1]).toMatch(/^\[1\]<input.*>.*<\/input>$/);
      expect(lines[2]).toMatch(/^\[2\]<a.*>.*<\/a>$/);
    });

    it('should maintain element mapping for actions', async () => {
      const analyzer = new DOMAnalyzerV2(`
        <html>
          <body>
            <button id="btn1">Button 1</button>
            <button id="btn2">Button 2</button>
          </body>
        </html>
      `);

      // Test element retrieval by index
      const element0 = analyzer.getElementById(0);
      const element1 = analyzer.getElementById(1);

      expect(element0).toBeDefined();
      expect(element1).toBeDefined();
      expect(element0!.attributes.id).toBe('btn1');
      expect(element1!.attributes.id).toBe('btn2');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed HTML gracefully', async () => {
      const malformedHtml = '<html><body><div><button>Unclosed<div></body>';

      expect(() => {
        analyzeDOMV2(malformedHtml);
      }).not.toThrow();
    });

    it('should handle empty HTML', async () => {
      const analysis = analyzeDOMV2('');

      expect(analysis.segments).toBeDefined();
      expect(analysis.highlightedElements).toBeDefined();
      expect(analysis.totalElements).toBe(0);
    });

    it('should handle DOM analysis failure', async () => {
      // Spy on console.error to suppress expected error logs
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (webToolkit as any).executeInTab = jest
        .fn()
        .mockRejectedValue(new Error('Page not accessible'));

      const result = await webToolkit.analyzeDOMV2();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Page not accessible');
      }

      // Verify console.error was called with expected error
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in analyzeDOMV2:', expect.any(Error));

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
