# WebToolkit Performance Test

This directory contains a comprehensive performance comparison test between `listElements` and `analyzePage` methods in the WebToolkit class.

## 📊 What This Test Measures

The test compares four key metrics:

1. **Execution Time** - How long each method takes to run (milliseconds)
2. **Element Count** - Number of elements detected/returned
3. **Output Size** - Size of the JSON output (bytes/KB)
4. **AI Readability Score** - Custom metric (0-100) measuring how AI-friendly the output structure is

## 🚀 How to Run the Test

### Option 1: Using the provided script (Recommended)

```bash
cd extension
./run-performance-test.sh
```

### Option 2: Using pnpm directly

```bash
cd extension
pnpm test -- --testPathPattern=web-toolkit-performance.test.ts --verbose
```

### Option 3: Using npm/yarn

```bash
cd extension
npm test -- --testPathPattern=web-toolkit-performance.test.ts --verbose
# or
yarn test --testPathPattern=web-toolkit-performance.test.ts --verbose
```

## 📈 Understanding the Results

### Sample Output

```
🧪 Testing: Buttons Only (button)
  listElements: 2.50ms | 15 elements | 2.3KB | 45/100 readability
  analyzePage:  8.75ms | 67 elements | 12.1KB | 85/100 readability
  Ratios: 3.50x time, 4.47x elements, 5.26x size

📊 SUMMARY STATISTICS
Average Execution Time:
  listElements: 3.25ms
  analyzePage:  9.80ms
  Ratio: 3.02x

Average AI Readability Score:
  listElements: 42.5/100
  analyzePage:  82.3/100
  Difference: +39.8 points
```

### Interpreting the Metrics

**Execution Time Ratio**

- `< 2x`: Acceptable performance overhead
- `2-5x`: Moderate overhead, consider use case
- `> 5x`: Significant overhead, use judiciously

**Element Count Ratio**

- `> 1x`: analyzePage detects more elements (expected)
- `< 1x`: Might indicate filtering differences

**Output Size Ratio**

- Larger outputs provide more information but consume more memory
- Consider network transfer if sending results remotely

**AI Readability Score**

- `0-30`: Basic structure
- `31-60`: Good structure with some metadata
- `61-80`: Well-structured with rich metadata
- `81-100`: Excellent structure optimized for AI consumption

## 🎯 Recommendations

The test provides automated recommendations based on the results:

### Use `analyzePage` when:

- You need comprehensive page understanding
- AI readability is important
- Performance overhead is acceptable
- You want semantic page structure
- Working with complex pages

### Use `listElements` when:

- You need specific element types only
- Performance is critical
- You have a targeted CSS selector
- Working with simple pages
- Memory usage is a concern

## 🔧 Test Configuration

The test uses a complex HTML page with:

- 50+ interactive elements (buttons, inputs, links, etc.)
- Semantic HTML structure (header, nav, main, aside, footer)
- Forms with various input types
- Hidden elements (to test filtering)
- ARIA roles and accessibility attributes
- Media controls and file inputs

## 📁 Files Structure

```
extension/
├── src/tests/
│   └── web-toolkit-performance.test.ts  # Main test file
├── run-performance-test.sh              # Easy run script
└── PERFORMANCE_TEST_README.md          # This file
```

## 🐛 Troubleshooting

**"No tests found"**

- Make sure you're in the `extension` directory
- Check that the test file exists: `src/tests/web-toolkit-performance.test.ts`

**"Dependencies not installed"**

- Run `pnpm install` in the extension directory

**"Permission denied" for shell script**

- Run `chmod +x run-performance-test.sh`

**Jest configuration issues**

- Ensure `jest.config.js` exists in the extension directory
- Check that JSDOM is installed: `pnpm add -D jsdom @types/jsdom`

## 🔬 Technical Details

The test creates a mock browser environment using JSDOM and mocks Chrome extension APIs. It measures performance using `performance.now()` and calculates readability scores based on:

- Data structure clarity (success/error indicators)
- Information density (element metadata richness)
- Metadata availability (counts, summaries, semantic structure)
- AI usability (indexed formats, highlight references)

The readability scoring algorithm awards points for features that make the output more useful for AI agents, such as:

- Clear success/error states
- Structured element data
- Unique identifiers and selectors
- Human-readable summaries
- Semantic page understanding

This comprehensive evaluation helps determine which method is most suitable for different use cases.
