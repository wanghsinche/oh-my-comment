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
    filter: node =>
      ['script', 'style', 'noscript', 'iframe', 'canvas', 'svg'].includes(node.nodeName.toLowerCase()),
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

  turndownService.addRule('filter-words', {
    filter: ['a','button','div', 'span'],
    replacement: (content, node) => {
      const blacklist = ['click here', 'read more', 'learn more', 'more info', 'report', 'submit', 'sign up', 'log in', 'download', '举报', '点击这里', '了解更多', '举报评论'];
      const text = content.trim().toLowerCase();
      if (blacklist.includes(text)) {
        return '';
      }
      return content;
    }
  })

  turndownService.addRule('get-meta-content', {
    filter: 'meta',
    replacement: (content, node) => {
      const meta = node as HTMLMetaElement;
      const usefulNames = ['description', 'keywords', 'author', 'viewport', 'og:title', 'og:description', 'twitter:title', 'twitter:description'];

      if (meta.name && usefulNames.includes(meta.name.toLowerCase())) {
        const name = meta.name ;
        const value = meta.content || '';
        return `\n\n[Meta: ${name} = ${value}]\n\n`;
      }
      return '';
    },
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
    const head = document.querySelector('head') || document.head;
    // If the main content already contains our input, we don't need to append context separately
    // as it will be captured (and marked) during the main content conversion.
    let originalHtml = '';
    if (strategy !== 'with-context' && mainContent.contains(inputElement)) { // just for potential future use
      originalHtml = mainContent.outerHTML;
    } else {
      const contextHtml = getContextHtml(inputElement, 10);
      originalHtml = `
        <!-- Page head Content -->
        ${head.outerHTML}
        
        <!-- Immediate Context Around Input -->
        ${contextHtml}
      `;
    }

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = originalHtml;

    tempContainer.querySelectorAll('*').forEach(element => {
      if (element instanceof HTMLElement) {
        ['aria-label', 'aria-description'].forEach(attr => {
          const value = element.getAttribute(attr);
          if (value) {
            const text = ` [${attr}: ${value}]`;
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
