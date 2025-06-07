/*
Goal: Extract actionable parts of webpages for AI agent understanding WITHOUT sending full HTML.

Strategy:
1. Look for semantic elements that naturally divide content (e.g., header, nav, main, section, footer)
2. Extracts all interactive elements from HTML content (e.g., 'a', 'button', 'input', 'select')
3. Assign highlight_index for all interactive elements, build a mapping from highlight_index to DOMElementNode
4. Implementation method `clickable_elements_to_string`, that converts clickable elements to a string representation for the agent to understand

Format: [index]<type>text</type> (e.g., '[35]<button aria-label='Submit form'>Submit</button>')

Based on browser-use approach for AI agent DOM understanding.
*/

export interface DOMElementNode {
  element: Element;
  tagName: string;
  attributes: Record<string, string>;
  textContent?: string;
  id?: string;
  selector: string;
  xpath: string;
  rect?: DOMRect;
  isVisible?: boolean;
  isInViewport?: boolean;
}

export interface HighlightedElement extends DOMElementNode {
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

export interface SemanticSegment {
  type: 'header' | 'nav' | 'main' | 'section' | 'article' | 'aside' | 'footer' | 'container';
  selector: string;
  element: Element;
  highlightedElements: HighlightedElement[];
  textContent?: string;
  depth: number;
}

export interface DOMAnalysisResult {
  segments: SemanticSegment[];
  highlightedElements: HighlightedElement[];
  elementMap: Map<number, DOMElementNode>;
  totalElements: number;
  clickableElementsString: string;
}

/**
 * Enhanced DOM Analyzer V2 - Main class for analyzing web pages for AI agents
 */
export class DOMAnalyzerV2 {
  private doc: Document;
  private elementMap = new Map<number, DOMElementNode>();
  private highlightIndex = 0;

  constructor(html: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(html, 'text/html');
  }

  /**
   * Analyze the DOM and return comprehensive results
   */
  public analyze(): DOMAnalysisResult {
    console.debug('🔍 Starting DOM Analysis...');

    const segments = this.findSemanticSegments();
    console.debug(
      `📋 Found ${segments.length} semantic segments:`,
      segments.map(s => s.type)
    );

    const highlightedElements = this.extractAndHighlightInteractiveElements();
    console.debug(`🎯 Detected ${highlightedElements.length} interactive elements`);

    const clickableElementsString = this.clickable_elements_to_string(highlightedElements);
    console.debug('✨ Generated AI-friendly string representation');

    const result: DOMAnalysisResult = {
      segments,
      highlightedElements,
      elementMap: this.elementMap,
      totalElements: highlightedElements.length,
      clickableElementsString,
    };

    // Output key analysis summary
    this.logAnalysisSummary(result);

    return result;
  }

  /**
   * Find semantic segments that naturally divide content
   */
  private findSemanticSegments(): SemanticSegment[] {
    const segments: SemanticSegment[] = [];

    // Look for semantic HTML5 elements first
    const semanticSelectors = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];

    semanticSelectors.forEach(tagName => {
      const elements = this.doc.querySelectorAll(tagName);
      elements.forEach(element => {
        const segment: SemanticSegment = {
          type: tagName as SemanticSegment['type'],
          selector: this.getCssSelector(element),
          element,
          highlightedElements: [],
          textContent: element.textContent?.trim() || undefined,
          depth: this.getElementDepth(element),
        };
        segments.push(segment);
      });
    });

    // If no semantic elements found, fall back to heuristic-based segmentation
    if (segments.length === 0) {
      const containers = this.findPotentialContainers();
      containers.forEach(element => {
        const segment: SemanticSegment = {
          type: 'container',
          selector: this.getCssSelector(element),
          element,
          highlightedElements: [],
          textContent: element.textContent?.trim() || undefined,
          depth: this.getElementDepth(element),
        };
        segments.push(segment);
      });
    }

    return segments;
  }

  /**
   * Extract all interactive elements and assign highlight indices
   */
  private extractAndHighlightInteractiveElements(): HighlightedElement[] {
    console.debug('🔍 Scanning for interactive elements...');
    const highlightedElements: HighlightedElement[] = [];

    // Define interactive element selectors
    const interactiveSelectors = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      'summary',
      'details',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="switch"]',
      '[role="combobox"]',
      '[role="slider"]',
      '[role="searchbox"]',
      '[role="textbox"]',
      '[role="option"]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[onclick]',
      '[onmousedown]',
      '[onkeydown]',
      '[onchange]',
      '[oninput]',
      // Elements with cursor pointer style
      '[style*="cursor: pointer"]',
      '[style*="cursor:pointer"]',
    ];

    const elements = this.doc.querySelectorAll(interactiveSelectors.join(','));
    console.debug(`🎯 Found ${elements.length} potential interactive elements`);

    let hiddenCount = 0;
    let duplicateCount = 0;

    elements.forEach(element => {
      // Skip hidden elements
      if (this.isElementHidden(element)) {
        hiddenCount++;
        return;
      }

      // Skip if it's a duplicate (some elements might match multiple selectors)
      if (highlightedElements.some(he => he.element === element)) {
        duplicateCount++;
        return;
      }

      const highlightedElement = this.createHighlightedElement(element);
      highlightedElements.push(highlightedElement);

      console.debug(
        `✅ [${highlightedElement.highlight_index}] ${highlightedElement.tagName}${highlightedElement.id ? `#${highlightedElement.id}` : ''} - ${highlightedElement.interactionType}`
      );

      // Add to element map
      this.elementMap.set(highlightedElement.highlight_index, {
        element,
        tagName: element.tagName.toLowerCase(),
        attributes: this.getElementAttributes(element),
        textContent: element.textContent?.trim() || undefined,
        id: element.id || undefined,
        selector: highlightedElement.selector,
        xpath: highlightedElement.xpath,
      });
    });

    if (hiddenCount > 0) {
      console.debug(`👻 Skipped ${hiddenCount} hidden elements`);
    }
    if (duplicateCount > 0) {
      console.debug(`🔄 Skipped ${duplicateCount} duplicate elements`);
    }

    console.debug(`🎉 Successfully processed ${highlightedElements.length} interactive elements!`);
    return highlightedElements;
  }

  /**
   * Create a highlighted element with assigned index and metadata
   */
  private createHighlightedElement(element: Element): HighlightedElement {
    const highlight_index = this.highlightIndex++;
    const tagName = element.tagName.toLowerCase();
    const attributes = this.getElementAttributes(element);

    // Determine interaction type
    let interactionType: HighlightedElement['interactionType'] = 'click';
    if (tagName === 'input' || tagName === 'textarea') {
      interactionType = 'input';
    } else if (tagName === 'select') {
      interactionType = 'select';
    } else if (tagName === 'form' || attributes.type === 'submit') {
      interactionType = 'submit';
    } else if (tagName === 'a' && attributes.href) {
      interactionType = 'navigate';
    }

    // Determine element type for display
    let type = tagName;
    if (attributes.type) {
      type = `${tagName}[type="${attributes.type}"]`;
    } else if (attributes.role) {
      type = `${tagName}[role="${attributes.role}"]`;
    }

    // Get associated labels
    const associatedLabels = this.getAssociatedLabels(element);

    // Check if element is in a form
    const { formId, formName } = this.getFormContext(element);

    return {
      element,
      highlight_index,
      tagName,
      type,
      interactionType,
      attributes,
      textContent: element.textContent?.trim() || undefined,
      id: element.id || undefined,
      selector: this.getCssSelector(element),
      xpath: this.getXPath(element),
      isVisible: !this.isElementHidden(element),
      value: this.getElementValue(element),
      placeholder: attributes.placeholder,
      ariaLabel: attributes['aria-label'],
      role: attributes.role,
      disabled: element.hasAttribute('disabled') || attributes['aria-disabled'] === 'true',
      hidden: this.isElementHidden(element),
      required: element.hasAttribute('required') || attributes['aria-required'] === 'true',
      checked: this.isElementChecked(element),
      selected: element.hasAttribute('selected') || attributes['aria-selected'] === 'true',
      formId,
      formName,
      labelText: associatedLabels.length > 0 ? associatedLabels[0] : undefined,
      associatedLabels: associatedLabels.length > 0 ? associatedLabels : undefined,
    };
  }

  /**
   * Convert clickable elements to string representation for AI agent understanding
   * Format: [index]<type>text</type> (e.g., '[35]<button aria-label='Submit form'>Submit</button>')
   */
  public clickable_elements_to_string(elements: HighlightedElement[]): string {
    const elementStrings: string[] = [];

    elements.forEach(element => {
      let displayText = '';
      let attributeText = '';

      // Get display text
      if (element.ariaLabel) {
        displayText = element.ariaLabel;
      } else if (element.labelText) {
        displayText = element.labelText;
      } else if (element.placeholder) {
        displayText = element.placeholder;
      } else if (element.textContent) {
        // Clean up whitespace and newlines from text content
        displayText = element.textContent.replace(/\s+/g, ' ').trim();
      } else if (element.value) {
        displayText = element.value;
      } else if (element.attributes.title) {
        displayText = element.attributes.title;
      } else if (element.attributes.alt) {
        displayText = element.attributes.alt;
      }

      // Limit display text length
      if (displayText.length > 50) {
        displayText = displayText.substring(0, 47) + '...';
      }

      // Add important attributes
      const importantAttrs: string[] = [];
      if (element.ariaLabel) {
        importantAttrs.push(`aria-label="${element.ariaLabel}"`);
      }
      if (element.placeholder && element.tagName === 'input') {
        importantAttrs.push(`placeholder="${element.placeholder}"`);
      }
      if (element.attributes.type && element.tagName === 'input') {
        importantAttrs.push(`type="${element.attributes.type}"`);
      }
      if (element.disabled) {
        importantAttrs.push('disabled');
      }
      if (element.required) {
        importantAttrs.push('required');
      }
      if (element.checked) {
        importantAttrs.push('checked');
      }
      if (element.attributes.href) {
        const href =
          element.attributes.href.length > 30
            ? element.attributes.href.substring(0, 27) + '...'
            : element.attributes.href;
        importantAttrs.push(`href="${href}"`);
      }

      if (importantAttrs.length > 0) {
        attributeText = ' ' + importantAttrs.join(' ');
      }

      // Create the formatted string
      const elementString = `[${element.highlight_index}]<${element.tagName}${attributeText}>${displayText}</${element.tagName}>`;
      elementStrings.push(elementString);
    });

    return elementStrings.join('\n');
  }

  /**
   * Get element by highlight index
   */
  public getElementById(highlightIndex: number): DOMElementNode | undefined {
    return this.elementMap.get(highlightIndex);
  }

  /**
   * Log a friendly summary of the analysis results
   */
  private logAnalysisSummary(result: DOMAnalysisResult): void {
    console.debug("\n🎉 DOM Analysis Complete! Here's what we found:");
    console.debug('═══════════════════════════════════════════════');

    // Segment summary
    console.debug(`📊 Page Structure:`);
    if (result.segments.length > 0) {
      result.segments.forEach((segment, _) => {
        const icon = this.getSegmentIcon(segment.type);
        console.debug(`  ${icon} ${segment.type.toUpperCase()} (depth: ${segment.depth})`);
      });
    } else {
      console.debug('  📦 No semantic segments found');
    }

    // Interactive elements summary
    console.debug(`\n🎯 Interactive Elements (${result.totalElements} total):`);
    const elementTypes = result.highlightedElements.reduce(
      (acc, el) => {
        acc[el.tagName] = (acc[el.tagName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    Object.entries(elementTypes).forEach(([tag, count]) => {
      const icon = this.getElementIcon(tag);
      console.debug(`  ${icon} ${count}x ${tag.toUpperCase()}`);
    });

    // Key metrics
    console.debug(`\n📈 Key Metrics:`);
    console.debug(`  🔢 Total Elements: ${result.totalElements}`);
    console.debug(`  🗂️ Segments: ${result.segments.length}`);
    console.debug(`  📝 String Length: ${result.clickableElementsString.length} chars`);

    const formsCount = result.highlightedElements.filter(el => el.formId || el.formName).length;
    if (formsCount > 0) {
      console.debug(`  📝 Form Elements: ${formsCount}`);
    }

    const disabledCount = result.highlightedElements.filter(el => el.disabled).length;
    if (disabledCount > 0) {
      console.debug(`  🚫 Disabled Elements: ${disabledCount}`);
    }

    console.debug('═══════════════════════════════════════════════\n');
  }

  /**
   * Get emoji icon for segment types
   */
  private getSegmentIcon(type: SemanticSegment['type']): string {
    const icons = {
      header: '🏠',
      nav: '🧭',
      main: '📄',
      section: '📑',
      article: '📰',
      aside: '📌',
      footer: '🦶',
      container: '📦',
    };
    return icons[type] || '📦';
  }

  /**
   * Get emoji icon for element types
   */
  private getElementIcon(tagName: string): string {
    const icons: Record<string, string> = {
      button: '🔘',
      input: '📝',
      select: '📋',
      textarea: '📄',
      a: '🔗',
      form: '📝',
      span: '🏷️',
      div: '📦',
      label: '🏷️',
    };
    return icons[tagName] || '🔹';
  }

  /**
   * Check if an element is hidden
   */
  private isElementHidden(element: Element): boolean {
    const style = element.getAttribute('style');
    return (
      element.hasAttribute('hidden') ||
      (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') ||
      (style != null &&
        (style.includes('display: none') ||
          style.includes('display:none') ||
          style.includes('visibility: hidden') ||
          style.includes('visibility:hidden')))
    );
  }

  /**
   * Get all attributes of an element
   */
  private getElementAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }
    return attributes;
  }

  /**
   * Get the value of an element
   */
  private getElementValue(element: Element): string | undefined {
    if ('value' in element) {
      return (element as HTMLInputElement).value || undefined;
    }
    return element.getAttribute('value') || undefined;
  }

  /**
   * Check if an element is checked
   */
  private isElementChecked(element: Element): boolean {
    if ('checked' in element) {
      return (element as HTMLInputElement).checked;
    }
    return element.getAttribute('aria-checked') === 'true';
  }

  /**
   * Get associated labels for an element
   */
  private getAssociatedLabels(element: Element): string[] {
    const labels: string[] = [];

    // For inputs, find labels by for attribute
    if (['input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
      if (element.id) {
        const labelElements = this.doc.querySelectorAll(`label[for="${element.id}"]`);
        labelElements.forEach(label => {
          if (label.textContent) {
            labels.push(label.textContent.trim());
          }
        });
      }

      // Check for parent label elements
      let parent = element.parentElement;
      while (parent && parent !== this.doc.body) {
        if (parent.tagName === 'LABEL' && parent.textContent) {
          labels.push(parent.textContent.trim());
          break;
        }
        parent = parent.parentElement;
      }
    }

    return labels;
  }

  /**
   * Get form context for an element
   */
  private getFormContext(element: Element): { formId?: string; formName?: string } {
    let formId: string | undefined;
    let formName: string | undefined;

    if ('form' in element) {
      const form = (element as HTMLInputElement).form;
      if (form) {
        formId = form.id || undefined;
        formName = form.getAttribute('name') || undefined;
      }
    } else {
      // For parsed HTML where form property might not be available
      let parent = element.parentElement;
      while (parent && parent !== this.doc.body) {
        if (parent.tagName === 'FORM') {
          formId = parent.id || undefined;
          formName = parent.getAttribute('name') || undefined;
          break;
        }
        parent = parent.parentElement;
      }
    }

    return { formId, formName };
  }

  /**
   * Find potential container elements using heuristics
   */
  private findPotentialContainers(): Element[] {
    const containers: Element[] = [];
    const divs = this.doc.querySelectorAll('div');

    Array.from(divs).forEach(div => {
      // Skip tiny containers
      if (div.children.length < 2) return;

      // Skip if it's a child of another already selected container
      if (containers.some(container => container.contains(div) && container !== div)) return;

      // Check for container-like class names
      const className = div.className.toLowerCase();
      const isContainer =
        className.includes('container') ||
        className.includes('section') ||
        className.includes('panel') ||
        className.includes('wrapper') ||
        className.includes('content') ||
        className.includes('layout') ||
        div.children.length >= 3;

      if (isContainer) {
        containers.push(div);
      }
    });

    // If no containers found, use the body's direct children as containers
    if (containers.length === 0) {
      const bodyChildren = Array.from(this.doc.body.children);
      if (bodyChildren.length > 0) {
        containers.push(this.doc.body);
      }
    }

    return containers;
  }

  /**
   * Generate CSS selector for an element
   */
  private getCssSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    let selector = element.tagName.toLowerCase();

    if (element.classList.length > 0) {
      selector += `.${Array.from(element.classList).join('.')}`;
    }

    // Add nth-child if needed for uniqueness
    if (element.parentElement) {
      const siblings = Array.from(element.parentElement.children);
      const sameTagSiblings = siblings.filter(el => el.tagName === element.tagName);
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(element as Element) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    // Prepend parent selector if needed
    if (
      element.parentElement &&
      element.parentElement.tagName !== 'HTML' &&
      element.parentElement.tagName !== 'BODY'
    ) {
      return `${this.getCssSelector(element.parentElement)} > ${selector}`;
    }

    return selector;
  }

  /**
   * Generate XPath for an element
   */
  private getXPath(element: Element): string {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    if (element.tagName.toLowerCase() === 'body') {
      return '/html/body';
    }

    if (!element.parentElement) {
      return '';
    }

    const siblings = Array.from(element.parentElement.children);
    const tagName = element.tagName.toLowerCase();
    const sameTagSiblings = siblings.filter(el => el.tagName.toLowerCase() === tagName);
    const index = sameTagSiblings.indexOf(element as Element) + 1;

    const parentPath = this.getXPath(element.parentElement);

    if (sameTagSiblings.length === 1) {
      return `${parentPath}/${tagName}`;
    }

    return `${parentPath}/${tagName}[${index}]`;
  }

  /**
   * Calculate element depth in DOM tree
   */
  private getElementDepth(element: Element): number {
    let depth = 0;
    let parent = element.parentElement;

    while (parent) {
      depth++;
      parent = parent.parentElement;
    }

    return depth;
  }
}

/**
 * Factory function to create and analyze DOM
 */
export function analyzeDOMV2(html: string): DOMAnalysisResult {
  const analyzer = new DOMAnalyzerV2(html);
  return analyzer.analyze();
}

/**
 * Utility function to get clickable elements string from HTML
 */
export function getClickableElementsString(html: string): string {
  const result = analyzeDOMV2(html);
  return result.clickableElementsString;
}

/**
 * Utility function to get element by highlight index
 */
export function getElementByIndex(
  html: string,
  highlightIndex: number
): DOMElementNode | undefined {
  const analyzer = new DOMAnalyzerV2(html);
  analyzer.analyze();
  return analyzer.getElementById(highlightIndex);
}
