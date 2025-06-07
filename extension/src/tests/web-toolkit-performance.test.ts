// Performance comparison test for WebToolkit.listElements vs WebToolkit.analyzePage
// Run with: pnpm test -- --testPathPattern=web-toolkit-performance.test.ts

import { WebToolkit } from '../tools/web-toolkit';
import { JSDOM } from 'jsdom';

interface PerformanceMetrics {
  executionTime: number;
  elementCount: number;
  outputSize: number;
  readabilityScore: number;
  memoryUsage?: number;
}

interface TestResult {
  method: string;
  metrics: PerformanceMetrics;
  output: any;
}

// Mock Chrome APIs for testing
const mockChrome = {
  tabs: {
    getCurrent: jest.fn().mockResolvedValue({ id: 1, windowId: 1 }),
    query: jest.fn().mockResolvedValue([{ id: 1, windowId: 1 }]),
    captureVisibleTab: jest.fn().mockImplementation(callback => {
      callback('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD');
    }),
  },
  scripting: {
    executeScript: jest.fn(),
  },
  debugger: {
    attach: jest.fn().mockResolvedValue(undefined),
    detach: jest.fn().mockResolvedValue(undefined),
    sendCommand: jest.fn().mockResolvedValue({}),
  },
  runtime: {
    lastError: null,
  },
};

// Complex test HTML with many different types of elements
const complexHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Test Page</title>
  <style>
    .hidden { display: none; }
    .pointer { cursor: pointer; }
  </style>
</head>
<body>
  <header id="main-header" class="site-header">
    <nav role="navigation" aria-label="Main navigation">
      <ul class="nav-list">
        <li><a href="/" class="nav-link active">Home</a></li>
        <li><a href="/about" class="nav-link">About</a></li>
        <li><a href="/products" class="nav-link">Products</a></li>
        <li><a href="/contact" class="nav-link">Contact</a></li>
      </ul>
      <button id="menu-toggle" aria-label="Toggle mobile menu" type="button">☰</button>
      <input type="search" placeholder="Search..." id="header-search" class="search-input">
    </nav>
  </header>

  <main id="main-content" role="main">
    <section class="hero-section">
      <h1>Welcome to Performance Test</h1>
      <p>This page contains various interactive elements for testing.</p>
      <button class="cta-button primary" onclick="handleCTA()">Get Started</button>
      <button class="cta-button secondary" disabled>Coming Soon</button>
    </section>

    <section class="form-section">
      <h2>Registration Form</h2>
      <form id="registration-form" name="userRegistration" action="/register" method="post">
        <fieldset>
          <legend>Personal Information</legend>
          
          <label for="first-name">First Name *</label>
          <input type="text" id="first-name" name="firstName" required placeholder="Enter your first name">
          
          <label for="last-name">Last Name *</label>
          <input type="text" id="last-name" name="lastName" required placeholder="Enter your last name">
          
          <label for="email">Email *</label>
          <input type="email" id="email" name="email" required placeholder="your@email.com">
          
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" placeholder="+1 (555) 123-4567">
          
          <label for="birth-date">Date of Birth</label>
          <input type="date" id="birth-date" name="birthDate">
        </fieldset>

        <fieldset>
          <legend>Preferences</legend>
          
          <label for="country">Country</label>
          <select id="country" name="country">
            <option value="">Select a country</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
          </select>
          
          <label for="interests">Interests</label>
          <select id="interests" name="interests" multiple>
            <option value="tech">Technology</option>
            <option value="sports">Sports</option>
            <option value="music">Music</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
          </select>
          
          <fieldset class="checkbox-group">
            <legend>Newsletter Subscriptions</legend>
            <input type="checkbox" id="news-weekly" name="newsletters" value="weekly" checked>
            <label for="news-weekly">Weekly Newsletter</label>
            
            <input type="checkbox" id="news-monthly" name="newsletters" value="monthly">
            <label for="news-monthly">Monthly Newsletter</label>
            
            <input type="checkbox" id="news-special" name="newsletters" value="special">
            <label for="news-special">Special Offers</label>
          </fieldset>
          
          <fieldset class="radio-group">
            <legend>Communication Preference</legend>
            <input type="radio" id="comm-email" name="communication" value="email" checked>
            <label for="comm-email">Email</label>
            
            <input type="radio" id="comm-phone" name="communication" value="phone">
            <label for="comm-phone">Phone</label>
            
            <input type="radio" id="comm-sms" name="communication" value="sms">
            <label for="comm-sms">SMS</label>
          </fieldset>
        </fieldset>

        <fieldset>
          <legend>Additional Information</legend>
          
          <label for="bio">Biography</label>
          <textarea id="bio" name="biography" rows="4" placeholder="Tell us about yourself..."></textarea>
          
          <label for="website">Website</label>
          <input type="url" id="website" name="website" placeholder="https://yourwebsite.com">
          
          <label for="age">Age</label>
          <input type="number" id="age" name="age" min="13" max="120" placeholder="25">
          
          <label for="salary">Expected Salary Range</label>
          <input type="range" id="salary" name="salary" min="30000" max="200000" step="5000" value="75000">
          <output for="salary">$75,000</output>
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="submit-btn">Register</button>
          <button type="reset" class="reset-btn">Clear Form</button>
          <input type="button" value="Save Draft" class="draft-btn">
        </div>
      </form>
    </section>

    <section class="interactive-section">
      <h2>Interactive Elements</h2>
      
      <div class="button-group">
        <button onclick="alert('Button 1')">Standard Button</button>
        <button type="button" class="icon-btn" aria-label="Download file">📁</button>
        <span role="button" tabindex="0" class="custom-button">Custom Button</span>
        <div class="pointer" onclick="handleDivClick()" role="button" tabindex="0">Clickable Div</div>
      </div>
      
      <div class="link-group">
        <a href="https://example.com" target="_blank">External Link</a>
        <a href="/internal" class="internal-link">Internal Link</a>
        <a href="mailto:test@example.com">Email Link</a>
        <a href="tel:+15551234567">Phone Link</a>
        <a href="#section1" class="anchor-link">Anchor Link</a>
      </div>
      
      <div class="toggle-group">
        <input type="checkbox" id="toggle1" class="toggle">
        <label for="toggle1">Toggle Option 1</label>
        
        <input type="checkbox" id="toggle2" class="toggle" checked>
        <label for="toggle2">Toggle Option 2</label>
      </div>
      
      <details>
        <summary>Expandable Content</summary>
        <p>This is the expanded content that can be toggled.</p>
        <button>Action Button</button>
      </details>
    </section>

    <section class="data-section">
      <h2>Data Elements</h2>
      
      <table role="table">
        <thead>
          <tr>
            <th role="columnheader">Name</th>
            <th role="columnheader">Age</th>
            <th role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>30</td>
            <td>
              <button class="edit-btn" data-id="1">Edit</button>
              <button class="delete-btn" data-id="1">Delete</button>
            </td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>25</td>
            <td>
              <button class="edit-btn" data-id="2">Edit</button>
              <button class="delete-btn" data-id="2">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <button class="page-btn" data-page="prev">Previous</button>
        <button class="page-btn active" data-page="1">1</button>
        <button class="page-btn" data-page="2">2</button>
        <button class="page-btn" data-page="3">3</button>
        <button class="page-btn" data-page="next">Next</button>
      </div>
    </section>

    <section class="media-section">
      <h2>Media Controls</h2>
      
      <video controls width="300" height="200">
        <source src="video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      
      <audio controls>
        <source src="audio.mp3" type="audio/mpeg">
        Your browser does not support the audio tag.
      </audio>
      
      <input type="file" id="file-upload" accept="image/*,video/*" multiple>
      <label for="file-upload" class="file-label">Choose Files</label>
    </section>
  </main>

  <aside class="sidebar" role="complementary">
    <h3>Quick Actions</h3>
    <ul class="action-list">
      <li><button class="quick-action" data-action="save">Save</button></li>
      <li><button class="quick-action" data-action="print">Print</button></li>
      <li><button class="quick-action" data-action="share">Share</button></li>
      <li><button class="quick-action" data-action="export">Export</button></li>
    </ul>
    
    <div class="widget">
      <h4>Settings</h4>
      <input type="checkbox" id="dark-mode" class="setting-toggle">
      <label for="dark-mode">Dark Mode</label>
      
      <input type="checkbox" id="notifications" class="setting-toggle" checked>
      <label for="notifications">Notifications</label>
    </div>
  </aside>

  <footer id="main-footer" role="contentinfo">
    <div class="footer-content">
      <div class="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/help">Help</a>
      </div>
      <div class="footer-actions">
        <button class="feedback-btn">Send Feedback</button>
        <button class="top-btn" onclick="scrollToTop()">Back to Top</button>
      </div>
    </div>
  </footer>

  <!-- Hidden elements that should not be detected -->
  <div class="hidden">
    <button>Hidden Button</button>
    <input type="text" placeholder="Hidden Input">
  </div>
  
  <div style="display: none;">
    <a href="/hidden">Hidden Link</a>
  </div>
</body>
</html>
`;

describe('WebToolkit Performance Comparison', () => {
  let webToolkit: WebToolkit;
  let dom: JSDOM;

  beforeAll(() => {
    // Set up JSDOM environment
    dom = new JSDOM(complexHTML, {
      url: 'https://test.example.com',
      pretendToBeVisual: true,
      resources: 'usable',
    });

    // Set up global objects
    global.document = dom.window.document;
    global.window = dom.window as any;
    global.chrome = mockChrome as any;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;

    // Mock getBoundingClientRect for all elements
    Object.defineProperty(dom.window.Element.prototype, 'getBoundingClientRect', {
      value: jest.fn(() => ({
        width: 100,
        height: 30,
        top: 0,
        left: 0,
        bottom: 30,
        right: 100,
      })),
    });

    // Mock getComputedStyle
    Object.defineProperty(dom.window, 'getComputedStyle', {
      value: jest.fn(() => ({
        visibility: 'visible',
        display: 'block',
        cursor: 'default',
      })),
    });

    // Mock scrollIntoView
    Object.defineProperty(dom.window.Element.prototype, 'scrollIntoView', {
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    webToolkit = new WebToolkit();

    // Mock executeInTab to return our test HTML content
    jest.spyOn(webToolkit as any, 'executeInTab').mockImplementation(async (...params: any[]) => {
      const [func, args = []] = params;
      // Execute the function in our JSDOM environment
      return func(...args);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const calculateReadabilityScore = (output: any): number => {
    let score = 0;

    if (typeof output === 'object' && output !== null) {
      // Structure clarity (0-30 points)
      if (output.success !== undefined) score += 10; // Has success indicator
      if (output.data !== undefined) score += 10; // Has data structure
      if (output.error !== undefined) score += 5; // Has error handling
      if (typeof output.data === 'object') score += 5; // Structured data

      // Information density (0-30 points)
      const dataObj = output.data || output;
      if (dataObj.elements || dataObj.highlightedElements) {
        const elements = dataObj.elements || dataObj.highlightedElements;
        if (Array.isArray(elements) && elements.length > 0) {
          score += 15; // Has element array

          const firstElement = elements[0];
          if (firstElement.textContent || firstElement.text) score += 5; // Has text content
          if (firstElement.attributes) score += 5; // Has attributes
          if (firstElement.selector || firstElement.uniqueSelector) score += 5; // Has selector
        }
      }

      // Metadata richness (0-20 points)
      if (dataObj.totalElements !== undefined) score += 5; // Has count
      if (dataObj.clickableElementsString) score += 10; // Has AI-readable summary
      if (dataObj.segments) score += 5; // Has semantic structure

      // Usability for AI (0-20 points)
      if (dataObj.clickableElementsString) {
        const lines = dataObj.clickableElementsString.split('\n').filter((l: string) => l.trim());
        if (lines.length > 0 && lines[0].includes('[') && lines[0].includes(']')) {
          score += 10; // Has indexed format
        }
      }
      if (dataObj.highlightedElements) {
        const hasIndexes = dataObj.highlightedElements.some(
          (el: any) => el.highlight_index !== undefined
        );
        if (hasIndexes) score += 10; // Has highlight indexes
      }
    }

    return Math.min(score, 100); // Cap at 100
  };

  const measurePerformance = async (
    method: () => Promise<any>,
    methodName: string
  ): Promise<TestResult> => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const output = await method();

    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const executionTime = endTime - startTime;

    // Calculate metrics
    let elementCount = 0;
    if (output?.data?.elements) {
      elementCount = output.data.elements.length;
    } else if (output?.data?.highlightedElements) {
      elementCount = output.data.highlightedElements.length;
    }

    const outputSize = JSON.stringify(output).length;
    const readabilityScore = calculateReadabilityScore(output);
    const memoryUsage = endMemory - startMemory;

    return {
      method: methodName,
      metrics: {
        executionTime,
        elementCount,
        outputSize,
        readabilityScore,
        memoryUsage,
      },
      output,
    };
  };

  const runComparison = async (
    selector: string
  ): Promise<{
    listElementsResult: TestResult;
    analyzePageResult: TestResult;
    comparison: any;
  }> => {
    console.log(`\n🔬 Running performance comparison for selector: "${selector}"`);

    // Test listElements
    const listElementsResult = await measurePerformance(
      () => webToolkit.listElements(selector),
      'listElements'
    );

    // Test analyzePage
    const analyzePageResult = await measurePerformance(
      () => webToolkit.analyzePage(),
      'analyzePage'
    );

    // Calculate comparison metrics
    const comparison = {
      executionTimeRatio:
        analyzePageResult.metrics.executionTime / listElementsResult.metrics.executionTime,
      elementCountRatio:
        analyzePageResult.metrics.elementCount /
        Math.max(listElementsResult.metrics.elementCount, 1),
      outputSizeRatio: analyzePageResult.metrics.outputSize / listElementsResult.metrics.outputSize,
      readabilityDifference:
        analyzePageResult.metrics.readabilityScore - listElementsResult.metrics.readabilityScore,
      memoryUsageRatio:
        (analyzePageResult.metrics.memoryUsage || 0) /
        Math.max(listElementsResult.metrics.memoryUsage || 1, 1),
    };

    return {
      listElementsResult,
      analyzePageResult,
      comparison,
    };
  };

  describe('Performance Metrics', () => {
    test('Button elements comparison', async () => {
      const results = await runComparison('button');

      console.log('\n📊 Button Elements Results:');
      console.log(
        `listElements: ${results.listElementsResult.metrics.executionTime.toFixed(2)}ms, ${results.listElementsResult.metrics.elementCount} elements`
      );
      console.log(
        `analyzePage: ${results.analyzePageResult.metrics.executionTime.toFixed(2)}ms, ${results.analyzePageResult.metrics.elementCount} elements`
      );
      console.log(`Execution Time Ratio: ${results.comparison.executionTimeRatio.toFixed(2)}x`);
      console.log(`Element Count Ratio: ${results.comparison.elementCountRatio.toFixed(2)}x`);
      console.log(`Output Size Ratio: ${results.comparison.outputSizeRatio.toFixed(2)}x`);
      console.log(
        `Readability Score Difference: ${results.comparison.readabilityDifference.toFixed(1)} points`
      );

      expect(results.listElementsResult.metrics.elementCount).toBeGreaterThan(0);
      expect(results.analyzePageResult.metrics.elementCount).toBeGreaterThan(0);
      expect(results.listElementsResult.metrics.executionTime).toBeGreaterThan(0);
      expect(results.analyzePageResult.metrics.executionTime).toBeGreaterThan(0);
    });

    test('Generate full performance report', async () => {
      console.log('\n📈 COMPREHENSIVE PERFORMANCE REPORT');
      console.log('='.repeat(60));

      const testCases = [
        { selector: 'button', name: 'Buttons Only' },
        { selector: 'input', name: 'Inputs Only' },
        { selector: 'a', name: 'Links Only' },
        { selector: 'button, input, a', name: 'Common Interactives' },
      ];

      const allResults = [];

      for (const testCase of testCases) {
        console.log(`\n🧪 Testing: ${testCase.name} (${testCase.selector})`);
        const result = await runComparison(testCase.selector);
        allResults.push({ ...result, testCase });

        console.log(
          `  listElements: ${result.listElementsResult.metrics.executionTime.toFixed(2)}ms | ${result.listElementsResult.metrics.elementCount} elements | ${(result.listElementsResult.metrics.outputSize / 1024).toFixed(1)}KB | ${result.listElementsResult.metrics.readabilityScore}/100 readability`
        );
        console.log(
          `  analyzePage:  ${result.analyzePageResult.metrics.executionTime.toFixed(2)}ms | ${result.analyzePageResult.metrics.elementCount} elements | ${(result.analyzePageResult.metrics.outputSize / 1024).toFixed(1)}KB | ${result.analyzePageResult.metrics.readabilityScore}/100 readability`
        );
        console.log(
          `  Ratios: ${result.comparison.executionTimeRatio.toFixed(2)}x time, ${result.comparison.elementCountRatio.toFixed(2)}x elements, ${result.comparison.outputSizeRatio.toFixed(2)}x size`
        );
      }

      // Calculate averages
      const avgListTime =
        allResults.reduce((sum, r) => sum + r.listElementsResult.metrics.executionTime, 0) /
        allResults.length;
      const avgAnalyzeTime =
        allResults.reduce((sum, r) => sum + r.analyzePageResult.metrics.executionTime, 0) /
        allResults.length;
      const avgListReadability =
        allResults.reduce((sum, r) => sum + r.listElementsResult.metrics.readabilityScore, 0) /
        allResults.length;
      const avgAnalyzeReadability =
        allResults.reduce((sum, r) => sum + r.analyzePageResult.metrics.readabilityScore, 0) /
        allResults.length;

      console.log('\n📊 SUMMARY STATISTICS');
      console.log('-'.repeat(40));
      console.log(`Average Execution Time:`);
      console.log(`  listElements: ${avgListTime.toFixed(2)}ms`);
      console.log(`  analyzePage:  ${avgAnalyzeTime.toFixed(2)}ms`);
      console.log(`  Ratio: ${(avgAnalyzeTime / avgListTime).toFixed(2)}x`);

      console.log(`\nAverage AI Readability Score:`);
      console.log(`  listElements: ${avgListReadability.toFixed(1)}/100`);
      console.log(`  analyzePage:  ${avgAnalyzeReadability.toFixed(1)}/100`);
      console.log(
        `  Difference: +${(avgAnalyzeReadability - avgListReadability).toFixed(1)} points`
      );

      console.log('\n🎯 RECOMMENDATIONS');
      console.log('-'.repeat(40));

      if (avgAnalyzeTime / avgListTime < 2) {
        console.log('✅ analyzePage has acceptable performance overhead (<2x)');
      } else {
        console.log('⚠️  analyzePage has significant performance overhead (>2x)');
      }

      if (avgAnalyzeReadability > avgListReadability + 20) {
        console.log('✅ analyzePage provides significantly better AI readability');
      } else {
        console.log('⚠️  analyzePage readability improvement is marginal');
      }

      console.log('\n💡 Use analyzePage when:');
      console.log('   - You need comprehensive page understanding');
      console.log('   - AI readability is important');
      console.log('   - Performance overhead is acceptable');

      console.log('\n💡 Use listElements when:');
      console.log('   - You need specific element types only');
      console.log('   - Performance is critical');
      console.log('   - You have a targeted selector');

      // Assertions for the test
      expect(allResults.length).toBe(testCases.length);
      expect(avgListTime).toBeGreaterThan(0);
      expect(avgAnalyzeTime).toBeGreaterThan(0);
      expect(avgListReadability).toBeGreaterThan(0);
      expect(avgAnalyzeReadability).toBeGreaterThan(avgListReadability);
    });
  });
});
