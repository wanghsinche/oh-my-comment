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
<context>
  <system_instructions>
    ${systemPrompt || 'You are a helpful assistant.'}
  </system_instructions>

  <user_preferences>
    ${presetPrompts || 'No specific preferences provided.'}
  </user_preferences>

  <page_content_markdown>
    ${domContent}
  </page_content_markdown>

  <current_input_box_value>
    ${currentValue || '[Empty]'}
  </current_input_box_value>

  <task>
    Please generate a concise, insightful, and engaging reply for the input box marked with [HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR] in the <page_content_markdown>. 
    Consider the surrounding context and the <user_preferences> provided.
  </task>
</context>
`.trim();

        const response = await fetch('https://ark-cn-beijing.bytedance.net/api/v3/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
