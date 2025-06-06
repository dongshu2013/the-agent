# DOM Analyzer V2 - AI Agent Web Page Understanding

## Overview

DOM Analyzer V2 is an enhanced web page analysis tool designed specifically for AI agents to understand and interact with web pages without sending full HTML content. It extracts actionable elements, assigns highlight indices, and provides a structured representation optimized for AI processing.

## Key Features

### 🎯 Core Functionality

- **Semantic Segmentation**: Automatically identifies semantic HTML5 sections (header, nav, main, footer, etc.)
- **Interactive Element Detection**: Finds all clickable, interactive elements on a page
- **Highlight Index System**: Assigns unique indices to interactive elements for AI reference
- **Element Mapping**: Creates bidirectional mapping between indices and DOM elements
- **String Representation**: Converts elements to AI-friendly string format

### 🔍 Element Detection Capabilities

- Native HTML elements: `button`, `input`, `select`, `textarea`, `a[href]`
- ARIA roles: `button`, `link`, `checkbox`, `radio`, `menuitem`, `tab`, etc.
- Interactive attributes: `[tabindex]`, `[onclick]`, `[contenteditable]`
- Visual cues: `cursor: pointer` style detection
- Form relationships: label associations, form context
- Accessibility states: disabled, hidden, required, checked

### 📊 Output Formats

- **Structured Objects**: Full metadata for programmatic access
- **String Representation**: `[index]<type>text</type>` format for AI consumption
- **Element Mapping**: Direct DOM element access by highlight index

## Installation & Usage

### Basic Usage

```typescript
import { DOMAnalyzerV2, analyzeDOMV2, getClickableElementsString } from './tools/dom-analyzer-v2';

// Method 1: Using the class directly
const analyzer = new DOMAnalyzerV2(htmlContent);
const result = analyzer.analyze();

// Method 2: Using factory function
const result = analyzeDOMV2(htmlContent);

// Method 3: Get just the string representation
const clickableString = getClickableElementsString(htmlContent);
```

### Advanced Usage

```typescript
// Analyze a webpage
const result = analyzeDOMV2(document.documentElement.outerHTML);

// Access semantic segments
result.segments.forEach(segment => {
  console.log(`${segment.type}: ${segment.selector}`);
  console.log(`Interactive elements: ${segment.highlightedElements.length}`);
});

// Get specific element by index
const element = result.elementMap.get(5);
if (element) {
  // Access the actual DOM element
  element.element.click();
}

// AI-friendly string representation
console.log(result.clickableElementsString);
// Output:
// [0]<a href="/home">Home</a>
// [1]<button type="submit" aria-label="Submit form">Login</button>
// [2]<input type="text" placeholder="Enter username" required>Enter username</input>
```

## API Reference

### DOMAnalyzerV2 Class

#### Constructor

```typescript
constructor(html: string)
```

Creates a new analyzer instance with the provided HTML content.

#### Methods

##### `analyze(): DOMAnalysisResult`

Performs complete DOM analysis and returns structured results.

##### `clickable_elements_to_string(elements: HighlightedElement[]): string`

Converts highlighted elements to AI-friendly string format.

##### `getElementById(highlightIndex: number): DOMElementNode | undefined`

Retrieves element information by highlight index.

### Interfaces

#### `DOMAnalysisResult`

```typescript
interface DOMAnalysisResult {
  segments: SemanticSegment[];
  highlightedElements: HighlightedElement[];
  elementMap: Map<number, DOMElementNode>;
  totalElements: number;
  clickableElementsString: string;
}
```

#### `HighlightedElement`

```typescript
interface HighlightedElement extends DOMElementNode {
  highlight_index: number;
  type: string;
  interactionType: 'click' | 'input' | 'select' | 'submit' | 'navigate';
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  role?: string;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  checked?: boolean;
  selected?: boolean;
  formId?: string;
  formName?: string;
  labelText?: string;
  associatedLabels?: string[];
}
```

#### `SemanticSegment`

```typescript
interface SemanticSegment {
  type: 'header' | 'nav' | 'main' | 'section' | 'article' | 'aside' | 'footer' | 'container';
  selector: string;
  element: Element;
  highlightedElements: HighlightedElement[];
  textContent?: string;
  depth: number;
}
```

### Utility Functions

#### `analyzeDOMV2(html: string): DOMAnalysisResult`

Factory function for one-shot analysis.

#### `getClickableElementsString(html: string): string`

Quick function to get AI-friendly string representation.

#### `getElementByIndex(html: string, highlightIndex: number): DOMElementNode | undefined`

Utility to get specific element by index.

## String Format Specification

The `clickable_elements_to_string` method generates output in this format:

```
[index]<tagName attributes>displayText</tagName>
```

### Examples

- `[0]<a href="/home">Home</a>`
- `[1]<button type="submit" aria-label="Submit form">Login</button>`
- `[2]<input type="text" placeholder="Enter username" required>Enter username</input>`
- `[3]<select>Category Selection</select>`
- `[4]<div role="button">Custom Button</div>`

### Attribute Priority

1. **aria-label** - Highest priority for accessibility
2. **labelText** - Associated form labels
3. **placeholder** - Input placeholders
4. **textContent** - Visible text content
5. **value** - Input values
6. **title** - Title attributes
7. **alt** - Alt text for images

### Important Attributes Included

- `type` for input elements
- `href` for links (truncated if > 30 chars)
- `aria-label` for accessibility
- `placeholder` for inputs
- `disabled`, `required`, `checked` states

## Browser-Use Integration

This implementation follows patterns from the browser-use project for AI agent compatibility:

### Key Alignments

- **Highlight Index System**: Compatible with browser-use element referencing
- **String Format**: Matches expected AI input format
- **Element Types**: Covers all interactive elements browser-use targets
- **Accessibility Focus**: Prioritizes ARIA labels and semantic information

### Usage in AI Agents

```typescript
// Get page understanding for AI
const pageAnalysis = analyzeDOMV2(document.documentElement.outerHTML);

// Send to AI agent
const prompt = `
Available interactions on the page:
${pageAnalysis.clickableElementsString}

Total interactive elements: ${pageAnalysis.totalElements}
Page sections: ${pageAnalysis.segments.map(s => s.type).join(', ')}
`;

// AI responds with element index
const aiResponse = 'Click element [5]';
const elementIndex = parseInt(aiResponse.match(/\[(\d+)\]/)[1]);

// Execute action
const element = pageAnalysis.elementMap.get(elementIndex);
if (element) {
  element.element.click();
}
```

## Performance Considerations

### Optimization Features

- **Deduplication**: Avoids processing same element multiple times
- **Hidden Element Filtering**: Skips non-visible elements
- **Lazy Evaluation**: Only processes what's needed
- **Efficient Selectors**: Uses IDs when available, falls back to efficient paths

### Best Practices

1. **Cache Results**: Store analysis results when possible
2. **Incremental Updates**: Re-analyze only changed sections when possible
3. **Memory Management**: Clear large element maps when done
4. **Batch Processing**: Analyze multiple pages in batches if needed

## Testing

The implementation includes comprehensive tests covering:

- ✅ Semantic segment detection
- ✅ Interactive element extraction
- ✅ Highlight index assignment
- ✅ Element mapping functionality
- ✅ String format generation
- ✅ Form and label associations
- ✅ Accessibility attribute handling
- ✅ Edge cases (empty HTML, no semantic elements)

Run tests with:

```bash
npm test src/tests/dom-analyzer-v2.test.ts
```

## Browser Compatibility

### Supported Features

- **DOM Parser**: Works in all modern browsers
- **ES6+ Features**: Uses modern JavaScript features
- **TypeScript**: Full type safety and IntelliSense support

### Requirements

- Modern browser with DOM Parser support
- JavaScript ES6+ environment
- TypeScript 4.0+ for development

## Comparison with V1

| Feature           | V1      | V2          |
| ----------------- | ------- | ----------- |
| Highlight Indices | ❌      | ✅          |
| Element Mapping   | ❌      | ✅          |
| String Format     | ❌      | ✅          |
| Semantic Segments | ✅      | ✅ Enhanced |
| ARIA Support      | ✅      | ✅ Enhanced |
| Form Context      | ✅      | ✅ Enhanced |
| AI Integration    | Partial | ✅ Full     |

## Future Enhancements

### Planned Features

- **Visual Element Detection**: Detect elements by visual cues
- **Dynamic Content Handling**: Support for SPA and dynamic content
- **Performance Monitoring**: Track analysis performance metrics
- **Custom Selectors**: Allow custom element detection rules

### Browser-Use Integration

- **Action Simulation**: Direct action execution support
- **Screenshot Integration**: Visual element highlighting
- **Multi-frame Support**: Handle iframes and nested contexts

## License

This implementation is part of the Chrome Extension project and follows the same licensing terms.

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure TypeScript compatibility
5. Test across different HTML structures

For questions or contributions, please refer to the main project documentation.
