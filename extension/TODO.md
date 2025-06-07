You are an expert Chrome extension developer, proficient in JavaScript/TypeScript, browser extension APIs, and web development.

Use online search and deep thinking to achieve the requirements based on the content.

# Goal 1

Extract actionable parts of webpages for AI agent understanding WITHOUT sending full HTML.

## Context

### Reference

@https://www.notion.so/kevintao1024/browser-use-FAQ-202f5846b26d80ec8227c2b01b4d70d9
@https://github.com/browser-use/browser-use
@dom-analyzer.ts

### Project Info

- A Chrome Extension implemented using the plasmo framework.
- This project is built with TypeScript, React, and webpack.

## Requirements

### Strategy

1. Look for semantic elements that naturally divide content (e.g., header, nav, main, section, footer)
2. Extracts all interactive elements from HTML content (e.g., 'a', 'button', 'input', 'select')
3. Assign highlight_index for all interactive elements, build a mapping from highlight_index to DOMElementNode
4. Implementation method `clickable_elements_to_string`, that converts clickable elements to a string representation for the agent to understand. Format elements with their highlight index, tag name, attributes, and text. `[index]<type>text</type>` (e.g., '[35]<button aria-label='Submit form'>Submit</button>')

### Code Principle

- Refer to browser-use and @dom-analyzer.ts , implement `dom-analyzer-v2.ts` in @/extension
- The code is concise and efficient, easy to read and maintain
- Write test code to ensure that the code runs correctly

# Goal 2

A better way for AI to understand and operate webpages.

- NOT send the entire HTML using `listElements`.
- Add `analyzePage` to get the analyzed web page content of `DOMAnalysisResult` and give it to AI.
- Add `clickElementByIndex` to click an element using its highlight index from `analyzePage`.

## Context

@tool-descriptions.ts @web-toolkit.ts @index.ts @dom-analyzer-v2.ts @README-DOM-ANALYZER-V2.md

## Requirements

- The code is concise and efficient, easy to read and maintain.
- If use `DOMParser` in Chrome Background JS environment, will cause error `DOMParser is not defined`. Use appropriate solutions and correct code to achieve the requirements.

Complete the Goal 2 according to @TODO.md and give me the correct code and documentation to implement the requirements.
