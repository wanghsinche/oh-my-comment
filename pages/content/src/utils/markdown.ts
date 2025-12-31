import TurndownService from 'turndown';

export const getMarkdownFromPage = (inputElement: HTMLElement): string => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Clean noise
  turndownService.addRule('remove-noise', {
    filter: node =>
      ['script', 'style', 'noscript', 'iframe', 'head', 'canvas', 'svg'].includes(node.nodeName.toLowerCase()),
    replacement: () => '',
  });

  turndownService.addRule('strip-img-src', {
    filter: 'img',
    replacement: (content, node) => {
      const img = node as HTMLImageElement;
      const alt = img.alt ? ` (alt: ${img.alt})` : '';
      return `[image${alt}]`;
    },
  });

  turndownService.addRule('strip-media-src', {
    filter: ['video', 'audio'],
    replacement: (content, node) => `[${node.nodeName.toLowerCase()}]`,
  });

  turndownService.addRule('strip-link-href', {
    filter: 'a',
    replacement: content => content,
  });

  const TARGET_ATTRIBUTE = 'data-oh-my-comment-target';

  // Rule to mark the current input element
  turndownService.addRule('mark-current-input', {
    filter: node => (node as HTMLElement).getAttribute?.(TARGET_ATTRIBUTE) === 'true',
    replacement: () => '\n\n[HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR]\n\n',
  });

  // 10-level ancestor context extraction
  const getContextHtml = (element: HTMLElement, levels: number): string => {
    let current: HTMLElement | null = element;
    for (let i = 0; i < levels; i++) {
      if (current?.parentElement) {
        current = current.parentElement;
      } else {
        break;
      }
    }
    return current?.outerHTML || '';
  };

  // Temporarily mark the input element
  inputElement.setAttribute(TARGET_ATTRIBUTE, 'true');

  try {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;

    // If the main content already contains our input, we don't need to append context separately
    // as it will be captured (and marked) during the main content conversion.
    let originalHtml = '';
    if (mainContent.contains(inputElement)) {
      originalHtml = mainContent.outerHTML;
    } else {
      const contextHtml = getContextHtml(inputElement, 10);
      originalHtml = `
        <!-- Page Main Content -->
        ${mainContent.outerHTML}
        
        <!-- Immediate Context Around Input -->
        ${contextHtml}
      `;
    }

    const rawMarkdown = turndownService.turndown(originalHtml);

    // URL cleaning
    const markdown = rawMarkdown.replace(/(https?:\/\/|\/)[^\s)]+/g, url => (url.length > 20 ? '[url]' : url));

    return markdown;
  } finally {
    // Always remove the marker
    inputElement.removeAttribute(TARGET_ATTRIBUTE);
  }
};
