import { createRoot, Root } from 'react-dom/client';
import App from './App';
import { disabledHostsStorage } from '@extension/storage';

console.log('content script loaded');

let currentInput: HTMLElement | null = null;
let injectedDiv: HTMLDivElement | null = null;
let root: Root | null = null;

function isEditable(element: HTMLElement): boolean {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  if (element.tagName.toLowerCase().startsWith('shreddit-')) {
    const richTextEditor = element.querySelector('[contenteditable="true"]');
    if (richTextEditor) {
      return true;
    }
  }
  return false;
}

function findClosestEditable(element: HTMLElement | null): HTMLElement | null {
  while (element) {
    if (isEditable(element)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function reposition() {
  if (currentInput && injectedDiv) {
    const rect = currentInput.getBoundingClientRect();
    // Position at bottom-right corner, slightly offset outward
    injectedDiv.style.top = `${window.scrollY + rect.bottom + 8}px`;
    injectedDiv.style.left = `${window.scrollX + rect.right - 48}px`;
  }
}

function handleEvent(event: Event) {
  const target = event.target as HTMLElement;
  const editableElement = findClosestEditable(target);

  if (editableElement) {
    if (currentInput === editableElement && injectedDiv) {
      return;
    }

    if (injectedDiv) {
      root?.unmount();
      injectedDiv.remove();
    }

    currentInput = editableElement;

    injectedDiv = document.createElement('div');
    injectedDiv.id = 'oh-my-comment-host';
    injectedDiv.style.position = 'absolute';
    injectedDiv.style.zIndex = '999999';
    injectedDiv.style.pointerEvents = 'none';
    document.body.appendChild(injectedDiv);

    const shadowRoot = injectedDiv.attachShadow({ mode: 'open' });
    const rootContainer = document.createElement('div');
    rootContainer.style.pointerEvents = 'auto';
    shadowRoot.appendChild(rootContainer);

    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content/style.css');
    shadowRoot.appendChild(styleLink);

    reposition();

    root = createRoot(rootContainer);
    root.render(<App inputElement={currentInput} />);
  } else {
    const isInsideShadow = injectedDiv && event.composedPath().includes(injectedDiv);

    if (injectedDiv && !isInsideShadow) {
      root?.unmount();
      injectedDiv.remove();
      injectedDiv = null;
      currentInput = null;
      root = null;
    }
  }
}

async function init() {
  const disabledHosts = await disabledHostsStorage.get();
  const currentHost = window.location.host;

  if (disabledHosts.includes(currentHost)) {
    console.log(`[Oh My Comment] Disabled on ${currentHost}`);
    return;
  }

  document.addEventListener('click', handleEvent);
  document.addEventListener('focusin', handleEvent);
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);
}

init();
