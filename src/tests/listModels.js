import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
        const data = await response.json();
        
        console.log("\n=== Available Gemini Models ===\n");
        
        if (data.models) {
            data.models.forEach(model => {
                console.log(`Model: ${model.name}`);
                console.log(`Display Name: ${model.displayName}`);
                console.log(`Supported Methods: ${model.supportedGenerationMethods?.join(", ")}`);
                console.log("---");
            });
        } else {
            console.log("Error:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
