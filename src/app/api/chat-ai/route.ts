import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

if (!process.env.CLAUDE_API_KEY) {
  throw new Error('CLAUDE_API_KEY is not set in environment variables');
}

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '', // Pastikan tidak undefined
});

export async function POST(req: Request) {
  try {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    const { message, files } = await req.json();

    // Buat konteks dari file yang dilampirkan
    const fileContexts = files.map((f: any) => 
      `File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``
    ).join('\n\n');

    const completion = await anthropic.messages.create({
      messages: [{
        role: "user",
        content: `You are an AI programming assistant. As Claude, analyze the following code and suggest improvements. Provide specific changes in a structured format that can be automatically applied.

Context:
${fileContexts}

User Query: ${message}

Please format your response to include:
1. A clear explanation of the changes
2. The exact code modifications in a structured JSON format like:
{
  "file": "path/to/file",
  "changes": [{
    "content": "new code here",
    "range": {
      "startLine": 1,
      "startColumn": 1,
      "endLine": 1,
      "endColumn": 1
    }
  }]
}`
      }],
      model: "claude-2",
      max_tokens: 1024,
    });

    // Parse response to extract structured suggestions
    const response = completion.content[0].text;
    let suggestions = [];
    
    try {
      // Attempt to extract JSON from the response
      const match = response.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        // Ensure suggestions is an array
        suggestions = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (e) {
      console.error('Failed to parse AI suggestions:', e);
    }

    // Get original content for each suggestion
    const enhancedSuggestions = await Promise.all(
      suggestions.map(async (suggestion: any) => {
        try {
          // Use absolute path from UPLOAD_DIR
          const filePath = suggestion.file.replace(/^\//, ''); // Remove leading slash
          const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/read-file?path=${encodeURIComponent(filePath)}`);
          
          if (!response.ok) {
            console.error(`Failed to get file content: ${response.statusText}`);
            return {
              ...suggestion,
              originalContent: '' // Provide empty string as fallback
            };
          }

          const data = await response.json();
          return {
            ...suggestion,
            originalContent: data.content || ''
          };
        } catch (error) {
          console.error(`Failed to get original content for ${suggestion.file}:`, error);
          return {
            ...suggestion,
            originalContent: '' // Provide empty string as fallback
          };
        }
      })
    );

    const aiResponse = {
      role: "ai",
      text: response,
      suggestions: enhancedSuggestions
    };

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error('Chat AI Error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to process request', 
      details: error.message 
    }, { status: 500 });
  }
}
