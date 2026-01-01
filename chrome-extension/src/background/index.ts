import 'webextension-polyfill';
import { presetPromptsStorage, apiKeyStorage, usageStorage } from '@extension/storage';
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
// import { createCerebras } from '@ai-sdk/cerebras';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'generateReply') {
    (async () => {
      try {
        console.log('Received generateReply message from content script:', request.payload);

        const personas = await presetPromptsStorage.get();
        const apiKey = await apiKeyStorage.get();
        const { domContent, currentValue, prompt: systemPrompt, personaId } = request.payload;

        if (!apiKey) {
          throw new Error('API Key is not configured. Please set it in the extension options.');
        }

        const selectedPersona =
          personas.find(p => p.id === personaId) || personas.find(p => p.isDefault) || personas[0];
        const personaPrompt = selectedPersona?.prompt || 'No specific preferences provided.';

        const combinedPromptContent = `
<context>
  <system_instructions>
    Today's date: ${new Date().toISOString().split('T')[0]}
    ${systemPrompt || 'You are a helpful assistant.'}
  </system_instructions>

  <user_preferences>
    ${personaPrompt}
  </user_preferences>

  <page_content_markdown>
    ${domContent}
  </page_content_markdown>

  <current_input_box_value>
    ${currentValue || '[Empty]'}
  </current_input_box_value>

  <task>
    Please generate a concise and engaging content for the input box marked with [HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR] in the <page_content_markdown>. 
    If you can not find such a marker, generate content relevant to the overall context of the page. and focus on the bottom part of the content, that is likely where the input box is located.
    Consider the surrounding context and the <user_preferences> provided. **DO NOT include any unnecessary explanations or additional text—only provide the content to be inserted.**
  </task>
</context>
`.trim();

        // Previous Implementation: Google Gemini
        const google = createGoogleGenerativeAI({
          apiKey,
        });

        const { text, usage } = await generateText({
          model: google('gemini-flash-lite-latest'),
          prompt: combinedPromptContent,
        });

        console.log('LLM API Response:', text);
        console.log('LLM Usage:', usage);

        // Update usage stats
        const currentUsage = await usageStorage.get();
        await usageStorage.set({
          requestCount: (currentUsage.requestCount || 0) + 1,
          totalInputTokens: (currentUsage.totalInputTokens || 0) + (usage?.inputTokens || 0),
          totalOutputTokens: (currentUsage.totalOutputTokens || 0) + (usage?.outputTokens || 0),
        });

        const filteredReply = filterOutput(text || 'No reply generated.');
        sendResponse({ reply: filteredReply });

        // To use legacy implementation, uncomment the following line and comment out the SDK logic above:
        // const legacyReply = await generateReplyLegacy(apiKey, combinedPromptContent);
        // sendResponse({ reply: filterOutput(legacyReply) });

      } catch (error) {
        console.error('Error in generateReply handler:', error);
        sendResponse({ reply: `Error: ${(error as Error).message}` });
      }
    })();

    return true; // Keep the message port open for the async response
  }
});

function filterOutput(text: string) {
  return text.replace(/\[HERE_IS_THE_INPUT_BOX_I_WANT_TO_GENERATE_FOR\]/g, '').trim();
}

/**
 * Legacy HTTP fetch implementation for reference or fallback.
 */
async function generateReplyLegacy(apiKey: string, promptContent: string) {
  const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
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
              text: promptContent,
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
  console.log('Legacy LLM API Response:', data);

  return data.choices[0]?.message?.content || 'No reply generated.';
}
