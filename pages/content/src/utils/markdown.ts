import TurndownService from 'turndown';

export const getMarkdownFromPage = (inputElement: HTMLElement): string => {
  const strategy: string = 'with-context';

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Clean noise
  turndownService.addRule('remove-noise', {
    filter: node => ['script', 'style', 'noscript', 'iframe', 'canvas', 'svg'].includes(node.nodeName.toLowerCase()),
    replacement: () => '',
  });

  turndownService.addRule('strip-img-src', {
    filter: 'img',
    replacement: (content, node) => {
      const img = node as HTMLImageElement;
      const title = img.title ? ` (title: ${img.title})` : '';
      const alt = img.alt ? ` (alt: ${img.alt})` : '';
      if (!img.alt && !img.title){
        return '';
      } 
      return `[IMG${alt}${title}]`;
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

  turndownService.addRule('filter-action-links', {
    filter: ['a', 'button', 'div', 'span'],
    replacement: (content, node) => {
      const blacklist = [
        'click here',
        'read more',
        'learn more',
        'more info',
        'report',
        'submit',
        'sign up',
        'log in',
        'download',
        '举报',
        '点击这里',
        '了解更多',
        '举报评论',
      ];
      const text = content.trim().toLowerCase();
      if (blacklist.includes(text)) {
        return '\n';
      }
      return content + '\n';
    },
  });

  turndownService.addRule('get-meta-content', {
    filter: 'meta',
    replacement: (content, node) => {
      const meta = node as HTMLMetaElement;
      const usefulNames = [
        'description',
        'keywords',
        'author',
        'viewport',
        'og:title',
        'og:description',
        'twitter:title',
        'twitter:description',
      ];

      if (meta.name && usefulNames.includes(meta.name.toLowerCase())) {
        const name = meta.name;
        const value = meta.content || '';
        return `\n\n[Meta: ${name} = ${value}]\n\n`;
      }
      return '\n';
    },
  });

  const TARGET_ATTRIBUTE = 'data-oh-my-comment-target';

  // Rule to mark the current input element
  turndownService.addRule('mark-current-input', {
    filter: node => (node as HTMLElement).getAttribute?.(TARGET_ATTRIBUTE) === 'true',
    replacement: () => '\n\n[HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR]\n\n',
  });

  // Context extraction with retry mechanism for insufficient content
  const getContextHtml = (element: HTMLElement, initialLevels: number): string => {
    let current: HTMLElement = element;
    let levelsClimbed = 0;
    const MIN_TEXT_LENGTH = 1000;
    const MAX_LEVELS = 50;

    // Helper to climb one step
    const climb = (el: HTMLElement): HTMLElement | null => {
      if (el.parentElement) {
        return el.parentElement;
      } else if (el.parentNode instanceof ShadowRoot) {
        return el.parentNode.host as HTMLElement;
      }
      return null;
    };

    // Initial climb
    for (let i = 0; i < initialLevels; i++) {
      const parent = climb(current);
      if (parent) {
        current = parent;
        levelsClimbed++;
      } else {
        break;
      }
    }

    // Retry loop if content is insufficient
    while (levelsClimbed < MAX_LEVELS) {
      // Stop if we hit major structural boundaries
      if (current.tagName.toLowerCase() === 'body' || current.tagName.toLowerCase() === 'html') {
        break;
      }

      // Check text content length
      if ((current.textContent?.length || 0) >= MIN_TEXT_LENGTH) {
        break;
      }

      // Climb more levels (step of 5)
      let climbedInStep = 0;
      for (let i = 0; i < 5; i++) {
        const parent = climb(current);
        if (parent) {
          current = parent;
          levelsClimbed++;
          climbedInStep++;
        } else {
          break;
        }
      }

      if (climbedInStep === 0) break; // Reached top
    }

    return current.outerHTML;
  };

  // Temporarily mark the input element
  inputElement.setAttribute(TARGET_ATTRIBUTE, 'true');

  try {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    const head = document.querySelector('head') || document.head;
    // If the main content already contains our input, we don't need to append context separately
    // as it will be captured (and marked) during the main content conversion.
    let originalHtml = '';

    let contextHtml = getContextHtml(inputElement, 10);
    

    originalHtml = `
        <!-- Page head Content -->
        ${head.outerHTML}
        
        <!-- Immediate Context Around Input -->
        ${contextHtml}
      `;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = originalHtml;

    tempContainer.querySelectorAll('*').forEach(element => {
      if (element instanceof HTMLElement) {
        ['aria-label', 'aria-description'].forEach(attr => {
          const value = element.getAttribute(attr);
          if (value) {
            const text = `(${attr}: ${value})`;
            const voidTags = [
              'area',
              'base',
              'br',
              'col',
              'embed',
              'hr',
              'img',
              'input',
              'link',
              'meta',
              'param',
              'source',
              'track',
              'wbr',
            ];
            if (voidTags.includes(element.tagName.toLowerCase())) {
              element.insertAdjacentText('afterend', text);
            } else {
              element.insertAdjacentText('beforeend', text);
            }
          }
        });
      }
    });

    const rawMarkdown = turndownService.turndown(tempContainer);

    // URL cleaning
    const markdown = rawMarkdown.replace(/(https?:\/\/|\/)[^\s)]+/g, url => (url.length > 20 ? '[url]' : url));

    return markdown;
  } finally {
    // Always remove the marker
    inputElement.removeAttribute(TARGET_ATTRIBUTE);
  }
};
