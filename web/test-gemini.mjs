#!/usr/bin/env node
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

async function testGemini() {
    try {
        const result = await generateText({
            model: google('gemini-3-flash-preview'),
            prompt: 'こんにちは',
        });

        console.log('✓ Gemini test successful!');
        console.log('Response:', result.text);
    } catch (error) {
        console.error('✗ Gemini test failed:');
        console.error(error);
    }
}

testGemini();
