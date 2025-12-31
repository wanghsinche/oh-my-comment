import 'webextension-polyfill';
import { presetPromptsStorage, apiKeyStorage } from '@extension/storage';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'generateReply') {
    (async () => {
      try {
        console.log('Received generateReply message from content script:', request.payload);

        const presetPrompts = await presetPromptsStorage.get();
        const apiKey = await apiKeyStorage.get();
        const { domContent, currentValue, prompt: systemPrompt } = request.payload;

        if (!apiKey) {
          throw new Error('ARK API Key is not configured. Please set it in the extension options.');
        }

        const combinedPromptContent = `
          System Prompt:
          ${systemPrompt || 'You are a helpful assistant.'}

          Preset User Preferences:
          ${presetPrompts || 'No preset prompts provided.'}

          Current Page Content (Markdown):
          ${domContent}

          Current Input Value (if any):
          ${currentValue}

          Task: Please generate a concise and appropriate reply based on the above context and system prompt.
        `;

        const response = await fetch('https://ark-cn-beijing.bytedance.net/api/v3/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'ep-20251227174236-pbsxr',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: combinedPromptContent,
                  },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`LLM API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('LLM API Response:', data);

        const generatedReply = data.choices[0]?.message?.content || 'No reply generated.';
        sendResponse({ reply: generatedReply });

      } catch (error) {
        console.error('Error in generateReply handler:', error);
        sendResponse({ reply: `Error: ${error.message}` });
      }
    })();

    return true; // Keep the message port open for the async response
  }
});
