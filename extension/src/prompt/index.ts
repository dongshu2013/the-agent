export const genUserPrompt = (contextPrompt: string, currentPrompt: string) => {
  return `
Given the chat history:
>>>>> Start of Chat History >>>>>>>>
${contextPrompt}
>>>>>> End of Chat History >>>>>>>>
Now reply to user's message: ${currentPrompt}`;
};
