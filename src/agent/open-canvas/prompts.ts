const DEFAULT_CODE_PROMPT_RULES = `- Do NOT include triple backticks when generating code. The code should be in plain text.`;

const APP_CONTEXT = `
<app-context>
The name of the application is "Open Canvas". Open Canvas is a web application where users have a chat window and a canvas to display an artifact.
Artifacts can be any sort of writing content, emails, code, or other creative writing work. Think of artifacts as content, or writing you might find on a blog, Google doc, or other writing platform.
Users only have a single artifact per conversation, however they have the ability to go back and fourth between artifact edits/revisions.
If a user asks you to generate something completely different from the current artifact, you may do this, as the UI displaying the artifacts will be updated to show whatever they've requested.
Even if the user goes from a 'text' artifact to a 'code' artifact.
</app-context>
`;

// Existing prompts...

export const RAG_RETRIEVAL_PROMPT = `You are an AI assistant that incorporates retrieved documents to generate your response.
The following documents have been retrieved based on the user's query:

<retrieved-documents>
{retrievedDocuments}
</retrieved-documents>

Use these documents as additional context to respond to the user's query below:

<user-query>
{userQuery}
</user-query>

Rules and guidelines:
<rules-guidelines>
- Ensure you reference the retrieved documents in your response, but do not include their full content unless explicitly requested by the user.
- Respond directly and concisely to the user's query while using the retrieved context appropriately.
- Avoid speculative answers; rely on the provided context whenever possible.
</rules-guidelines>`;

export const RAG_RETRIEVAL_UPDATE_ARTIFACT_PROMPT = `You are an AI assistant, and the user has requested updates to their artifact using the retrieved documents.

Here is the current artifact content:
<artifact>
{artifactContent}
</artifact>

The following documents have been retrieved based on the user's query:
<retrieved-documents>
{retrievedDocuments}
</retrieved-documents>

Use these retrieved documents as additional context to make the updates the user has requested.

Rules and guidelines:
<rules-guidelines>
- Respond with the updated artifact only. Do not include any tags, explanations, or extra text before or after.
- If a retrieved document contradicts the artifact, use your judgment to align with the user's query.
- Use proper markdown syntax if applicable, except when writing code, as the system does not render markdown for code.
- Do not wrap the response in triple backticks unless requested by the user.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>

{updateMetaPrompt}

Ensure you ONLY respond with the updated artifact.`;

export const RAG_RETRIEVAL_NEW_ARTIFACT_PROMPT = `You are an AI assistant tasked with generating a new artifact based on the user's query and the retrieved documents.

The following documents have been retrieved as context for the user's request:
<retrieved-documents>
{retrievedDocuments}
</retrieved-documents>

Generate the artifact based on the user's request:
<user-query>
{userQuery}
</user-query>

Rules and guidelines:
<rules-guidelines>
- Ensure you leverage the retrieved documents in generating the artifact.
- Respond with the entire artifact only. Do not include additional tags or explanations.
- If writing code, adhere to the provided rules for generating code artifacts.
${DEFAULT_CODE_PROMPT_RULES}
</rules-guidelines>`;

// Add new RAG prompts to exports alongside existing ones
export {
  NEW_ARTIFACT_PROMPT,
  UPDATE_HIGHLIGHTED_ARTIFACT_PROMPT,
  GET_TITLE_TYPE_REWRITE_ARTIFACT,
  OPTIONALLY_UPDATE_META_PROMPT,
  UPDATE_ENTIRE_ARTIFACT_PROMPT,
  CHANGE_ARTIFACT_LANGUAGE_PROMPT,
  CHANGE_ARTIFACT_READING_LEVEL_PROMPT,
  CHANGE_ARTIFACT_TO_PIRATE_PROMPT,
  CHANGE_ARTIFACT_LENGTH_PROMPT,
  ADD_EMOJIS_TO_ARTIFACT_PROMPT,
  ROUTE_QUERY_OPTIONS_HAS_ARTIFACTS,
  ROUTE_QUERY_OPTIONS_NO_ARTIFACTS,
  CURRENT_ARTIFACT_PROMPT,
  NO_ARTIFACT_PROMPT,
  ROUTE_QUERY_PROMPT,
  FOLLOWUP_ARTIFACT_PROMPT,
  ADD_COMMENTS_TO_CODE_ARTIFACT_PROMPT,
  ADD_LOGS_TO_CODE_ARTIFACT_PROMPT,
  FIX_BUGS_CODE_ARTIFACT_PROMPT,
  PORT_LANGUAGE_CODE_ARTIFACT_PROMPT,
  REFLECTIONS_QUICK_ACTION_PROMPT,
  CUSTOM_QUICK_ACTION_ARTIFACT_PROMPT_PREFIX,
  CUSTOM_QUICK_ACTION_CONVERSATION_CONTEXT,
  CUSTOM_QUICK_ACTION_ARTIFACT_CONTENT_PROMPT,
  RAG_RETRIEVAL_PROMPT, // Add RAG Retrieval Prompt
  RAG_RETRIEVAL_UPDATE_ARTIFACT_PROMPT, // Add RAG Update Artifact Prompt
  RAG_RETRIEVAL_NEW_ARTIFACT_PROMPT, // Add RAG New Artifact Prompt
};
