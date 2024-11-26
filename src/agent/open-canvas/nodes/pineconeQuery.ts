import { queryPinecone } from '@/lib/pinecone';
import { generateEmbedding } from '@/lib/embeddingGenerator'; // A utility to generate vector embeddings
import { generateLLMResponse } from '@/lib/llm'; // A utility for generating responses

export async function pineconeQuery(state, config) {
  const pineconeIndex = config.configurable?.pineconeIndex;
  if (!pineconeIndex) {
    throw new Error('Pinecone index not configured for this assistant.');
  }

  const userQuery = state.messages[state.messages.length - 1].content;
  const embedding = await generateEmbedding(userQuery); // Generate a query vector
  const matches = await queryPinecone(pineconeIndex, embedding);

  const retrievedContent = matches
    .map((match) => match.metadata?.content)
    .join('\n\n');

  const prompt = `Using the retrieved content below, generate a response to the user query:
  
Retrieved Content:
${retrievedContent}

User Query:
${userQuery}`;

  const response = await generateLLMResponse(prompt);

  return {
    messages: [...state.messages, { role: 'assistant', content: response }],
  };
}
