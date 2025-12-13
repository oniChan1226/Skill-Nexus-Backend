// Test script for Gemini AI integration
// Run with: node -r dotenv/config src/tests/testGemini.js

import dotenv from "dotenv";
dotenv.config();

// Test Gemini API connection
async function testGeminiConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment variables");
        console.log("\n📝 To fix this:");
        console.log("1. Go to https://aistudio.google.com/app/apikey");
        console.log("2. Create an API key");
        console.log("3. Add to your .env file: GEMINI_API_KEY=your_key_here");
        process.exit(1);
    }

    console.log("✅ API Key found");
    console.log("🧪 Testing Gemini API connection...\n");

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Say 'Hello from Gemini!' if you can hear me."
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ API Error:", errorData.error?.message || "Unknown error");
            console.log("\n🔧 Troubleshooting:");
            console.log("- Verify your API key is correct");
            console.log("- Check if the key has been activated");
            console.log("- Try generating a new key");
            process.exit(1);
        }

        const data = await response.json();
        const text = data.candidates[0]?.content?.parts[0]?.text || "";

        console.log("✅ Connection successful!");
        console.log("📝 Response:", text);
        console.log("\n🎉 Gemini is working! You're ready to use AI features.");
        
    } catch (error) {
        console.error("❌ Error testing connection:", error.message);
        process.exit(1);
    }
}

// Test similarity calculation
async function testSimilarityCalculation() {
    console.log("\n🧪 Testing skill similarity calculation...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `Rate the similarity between these two skill descriptions on a scale of 0 to 1, where 0 is completely different and 1 is identical. Only respond with a number between 0 and 1.

Skill 1: React expert with hooks and state management
Skill 2: ReactJS intermediate learning component lifecycle

Similarity score (0-1):`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 10
                    }
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            const score = data.candidates[0]?.content?.parts[0]?.text || "";
            console.log("✅ Similarity calculation working!");
            console.log("📊 Sample similarity score:", score.trim());
        }
    } catch (error) {
        console.log("⚠️  Similarity test failed (non-critical):", error.message);
    }
}

// Test recommendations
async function testRecommendations() {
    console.log("\n🧪 Testing skill recommendations...");
    
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `You are a career advisor. Given a Software Engineer who currently knows: JavaScript, React, Node.js and wants to learn: TypeScript, Docker.

Suggest exactly 5 complementary skills they should learn next to advance their career. Consider:
- Current skill gaps
- Industry trends
- Career progression
- Complementary technologies

Format your response EXACTLY as:
1. [Skill Name] - [Brief reason]
2. [Skill Name] - [Brief reason]
3. [Skill Name] - [Brief reason]
4. [Skill Name] - [Brief reason]
5. [Skill Name] - [Brief reason]`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        if (response.ok) {
            const data = await response.json();
            const recommendations = data.candidates[0]?.content?.parts[0]?.text || "";
            console.log("✅ Recommendations working!");
            console.log("📚 Sample recommendations:\n" + recommendations);
        }
    } catch (error) {
        console.log("⚠️  Recommendations test failed (non-critical):", error.message);
    }
}

// Run all tests
async function runTests() {
    console.log("🚀 Starting Gemini AI Integration Tests\n");
    console.log("=".repeat(50));
    
    await testGeminiConnection();
    await testSimilarityCalculation();
    await testRecommendations();
    
    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests completed!");
    console.log("\n📖 Next steps:");
    console.log("1. Run: npm run seed (to add sample data)");
    console.log("2. Run: npm run dev (to start the server)");
    console.log("3. Test AI endpoints with your API client");
    
    process.exit(0);
}

runTests();
