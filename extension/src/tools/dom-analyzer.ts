/*
Goal: Extract actionable parts of webpages for AI agent understanding without sending full HTML.

Strategy:
1. Interactive Elements:
   - Semantic: button, input, select, textarea, a[href]
   - Custom: [role], [tabindex], [onclick], [aria-*]
   - Style hints: cursor:pointer

2. Form & Label Relationships:
   - Link labels to inputs (via for/id or parent-child)
   - Map inputs/buttons to forms
   - Extract placeholders, required flags, values

3. States & Accessibility:
   - Capture aria-* attributes (label, checked, selected)
   - Identify hidden/disabled elements
   - Note ambiguous elements (e.g., multiple "Log In" buttons)

4. Position Context:
   - Use element coordinates for spatial relationships
   - Track z-index for overlay detection

Limitations:
- Can't detect JS-bound event listeners (addEventListener)
- Miss some ARIA states (haspopup, expanded, controls)
- Limited detection of off-screen elements
- Can't reliably infer visual style cues
*/

export interface DomNode {
  tagName: string;
  attributes: Record<string, string>;
  children: DomNode[];
  textContent?: string;
  id?: string;
  selector?: string;
  xpath?: string;
}

export interface InteractiveElement {
  tagName: string;
  type: string;
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  text?: string;
  ariaLabel?: string;
  role?: string;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  checked?: boolean;
  selected?: boolean;
  selector: string;
  xpath: string;
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  };
  formId?: string;
  formName?: string;
  labelText?: string;
  associatedLabels?: string[];
  zIndex?: number;
  isInViewport?: boolean;
  eventHandlers?: string[];
}

/**
 * Extracts all interactive elements from HTML content
 * @param html The HTML content to analyze
 * @returns Array of interactive elements with metadata
 */
export function extractInteractiveElements(html: string): InteractiveElement[] {
  const interactiveElements: InteractiveElement[] = [];

  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. Find all native interactive elements
  const nativeSelectors = [
    'button',
    'input',
    'select',
    'textarea',
    'a[href]',
    'label',
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
    '[tabindex]',
    '[contenteditable="true"]',
    '[draggable="true"]',
    '[onclick]',
    '[onmousedown]',
    '[onkeydown]',
    '[onchange]',
    '[oninput]',
    '[ondrop]',
    '[ontouchstart]',
    '[ontouchend]',
  ];

  const allInteractiveElements = doc.querySelectorAll(nativeSelectors.join(','));

  // 2. Process each element
  allInteractiveElements.forEach(element => {
    // Note: We can't use computedStyle or getBoundingClientRect with parsed HTML
    // So we'll extract what we can from the element's attributes

    const isHidden =
      element.hasAttribute('hidden') ||
      (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') ||
      (element.hasAttribute('style') &&
        (element.getAttribute('style')?.includes('display: none') ||
          element.getAttribute('style')?.includes('visibility: hidden')));

    // Get the CSS selector path
    const selector = getCssSelector(element);

    // Get the XPath
    const xpath = getXPath(element);

    // Determine element type
    let type = element.tagName.toLowerCase();
    if (element.hasAttribute('type')) {
      type = `${type}[type="${element.getAttribute('type')}"]`;
    } else if (element.hasAttribute('role')) {
      type = `${type}[role="${element.getAttribute('role')}"]`;
    }

    // Collect associated labels
    const associatedLabels: string[] = [];

    // For inputs, find labels by for attribute
    if (
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA'
    ) {
      if (element.id) {
        const labelElements = doc.querySelectorAll(`label[for="${element.id}"]`);
        labelElements.forEach(label => {
          if (label.textContent) {
            associatedLabels.push(label.textContent.trim());
          }
        });
      }

      // Also check for parent label elements
      let parent = element.parentElement;
      while (parent && parent !== doc.body) {
        if (parent.tagName === 'LABEL' && parent.textContent) {
          associatedLabels.push(parent.textContent.trim());
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Check if element is in a form
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
      while (parent && parent !== doc.body) {
        if (parent.tagName === 'FORM') {
          formId = parent.id || undefined;
          formName = parent.getAttribute('name') || undefined;
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Get any event handlers (limited to attributes)
    const eventHandlers: string[] = [];
    const eventAttributes = [
      'onclick',
      'onmousedown',
      'onkeydown',
      'onchange',
      'onfocus',
      'onblur',
      'onsubmit',
      'oninput',
      'ondrop',
      'ontouchstart',
      'ontouchend',
    ];
    eventAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        eventHandlers.push(attr);
      }
    });

    // Create the interactive element object
    const interactiveElement: InteractiveElement = {
      tagName: element.tagName.toLowerCase(),
      type,
      id: element.id || undefined,
      name: element.getAttribute('name') || undefined,
      value:
        'value' in element
          ? (element as HTMLInputElement).value
          : element.getAttribute('value') || undefined,
      placeholder: element.getAttribute('placeholder') || undefined,
      text: element.textContent ? element.textContent.trim() : undefined,
      ariaLabel: element.getAttribute('aria-label') || undefined,
      role: element.getAttribute('role') || undefined,
      disabled:
        element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true',
      hidden: isHidden,
      required:
        element.hasAttribute('required') || element.getAttribute('aria-required') === 'true',
      checked:
        'checked' in element
          ? (element as HTMLInputElement).checked
          : element.getAttribute('aria-checked') === 'true',
      selected:
        element.hasAttribute('selected') || element.getAttribute('aria-selected') === 'true',
      selector,
      xpath,
      formId,
      formName,
      labelText: associatedLabels.length > 0 ? associatedLabels[0] : undefined,
      associatedLabels: associatedLabels.length > 0 ? associatedLabels : undefined,
      eventHandlers: eventHandlers.length > 0 ? eventHandlers : undefined,
    };

    interactiveElements.push(interactiveElement);
  });

  // 3. Also look for divs/spans with cursor:pointer in inline style (limited)
  const allElements = doc.querySelectorAll('div, span, p, li');
  allElements.forEach(element => {
    // Skip if already processed (has a role, tabindex, onclick, etc.)
    if (
      element.hasAttribute('role') ||
      element.hasAttribute('tabindex') ||
      element.hasAttribute('onclick') ||
      element.tagName === 'A' ||
      element.tagName === 'BUTTON'
    ) {
      return;
    }

    // Check for cursor:pointer in inline style
    if (element.getAttribute('style')?.includes('cursor: pointer')) {
      const selector = getCssSelector(element);
      const xpath = getXPath(element);

      interactiveElements.push({
        tagName: element.tagName.toLowerCase(),
        type: `${element.tagName.toLowerCase()}[cursor=pointer]`,
        text: element.textContent ? element.textContent.trim() : undefined,
        selector,
        xpath,
      });
    }
  });

  // Note: We can't sort elements by position since we don't have access to getBoundingClientRect
  // with parsed HTML. We could sort by document order though.

  return interactiveElements;
}

/**
 * Generates a unique CSS selector for an element
 */
function getCssSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  let selector = element.tagName.toLowerCase();

  if (element.classList.length > 0) {
    selector += `.${Array.from(element.classList).join('.')}`;
  }

  // Add more specificity if needed
  if (selector === element.tagName.toLowerCase()) {
    // If it's just a tag name, make it more specific
    const siblings = element.parentElement?.children || [];
    if (siblings.length > 1) {
      // Find the index among same tag siblings
      const sameTagSiblings = Array.from(siblings).filter(el => el.tagName === element.tagName);
      const index = Array.from(sameTagSiblings).indexOf(element as Element);
      if (index > -1 && sameTagSiblings.length > 1) {
        selector += `:nth-of-type(${index + 1})`;
      }
    }
  }

  // If the element has a parent, prepend the parent's selector
  if (
    element.parentElement &&
    element.parentElement.tagName !== 'HTML' &&
    element.parentElement.tagName !== 'BODY'
  ) {
    return `${getCssSelector(element.parentElement)} > ${selector}`;
  }

  return selector;
}

/**
 * Generates an XPath for an element
 */
function getXPath(element: Element): string {
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

  const parentPath = getXPath(element.parentElement);

  if (sameTagSiblings.length === 1) {
    return `${parentPath}/${tagName}`;
  }

  return `${parentPath}/${tagName}[${index}]`;
}

/**
 * Calculate the depth of an element in the DOM tree
 * @param element The DOM element to check
 * @returns Number representing the depth (0 for top-level elements)
 */
function getElementDepth(element: Element): number {
  let depth = 0;
  let parent = element.parentElement;

  while (parent) {
    depth++;
    parent = parent.parentElement;
  }

  return depth;
}

/**
 * Represents a segment of the page with its elements and metadata
 */
export interface PageSegment {
  /** Type of segment (based on semantic HTML tag or 'container' for heuristic-based segments) */
  type: string;
  /** CSS selector for this segment */
  selector: string;
  /** Interactive elements within this segment */
  interactiveElements: InteractiveElement[];
  /** Text content of this segment */
  textContent?: string;
  /** Depth in the DOM tree (0 for top-level segments) */
  depth?: number;
}

/**
 * Find potential container elements that likely represent logical segments
 * based on heuristics like size, position, and content density
 */
function findPotentialContainers(doc: Document): Element[] {
  const potentialContainers: Element[] = [];

  // Look for large divs that contain multiple elements
  const largeDivs = doc.querySelectorAll('div');

  Array.from(largeDivs).forEach(div => {
    // Skip tiny containers or those with very little content
    if (div.children.length < 3) return;

    // Skip if it's a direct child of another already selected container
    if (potentialContainers.some(container => container.contains(div))) return;

    // Check for class names that suggest it's a container
    const className = div.className.toLowerCase();
    const isLikelyContainer =
      className.includes('container') ||
      className.includes('section') ||
      className.includes('panel') ||
      className.includes('wrapper') ||
      className.includes('content') ||
      className.includes('layout');

    // If it has a container-like class or it has significant content, include it
    if (isLikelyContainer || div.children.length >= 5) {
      potentialContainers.push(div);
    }
  });

  return potentialContainers;
}

/**
 * Segment HTML content into logical sections based on semantic HTML or heuristics
 * @param html HTML content to segment
 * @returns Array of page segments
 */
export function segmentHtmlContent(html: string): PageSegment[] {
  const segments: PageSegment[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // First look for semantic elements that naturally divide content
  const semanticContainers = doc.querySelectorAll(
    'header, nav, main, section, article, aside, footer'
  );

  // If we found semantic containers, use those as our primary segments
  if (semanticContainers.length > 0) {
    semanticContainers.forEach(container => {
      segments.push({
        type: container.tagName.toLowerCase(),
        selector: getCssSelector(container),
        interactiveElements: extractInteractiveElements(container.outerHTML),
        textContent: container.textContent?.trim() || undefined,
        depth: getElementDepth(container),
      });
    });
  } else {
    // Fall back to heuristic-based segmentation
    // Look for div containers with certain characteristics
    const potentialContainers = findPotentialContainers(doc);
    potentialContainers.forEach(container => {
      segments.push({
        type: 'container',
        selector: getCssSelector(container),
        interactiveElements: extractInteractiveElements(container.outerHTML),
        textContent: container.textContent?.trim() || undefined,
        depth: getElementDepth(container),
      });
    });
  }

  return segments;
}
