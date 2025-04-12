"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Initialize the Google AI SDK with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "")

export async function analyzeCharacterImage(imageBase64: string) {
  try {
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(",")[1]

    // Initialize the Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Set safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    // Prepare the prompt for character analysis
    const prompt = `
      Analyze this character image and provide a detailed description of the following aspects:
      1. Voice Style: How would this character likely speak? Tone, manner, and speech patterns.
      2. Walking Style: How would this character move and walk? Posture, gait, and movement style.
      3. Fashion Style: Describe the character's clothing style, aesthetic, and fashion choices.
      4. Personality Traits: What personality traits does this character likely have based on their appearance?
      
      Format your response as a JSON object with these keys: voice, walk, style, personality.
      Each value should be a detailed description (1-2 sentences).
    `

    // Prepare the image data for the API
    const imageData = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    }

    // Generate content with the model
    const result = await model.generateContent([prompt, imageData], { safetySettings })
    const response = await result.response
    const text = response.text()

    // Parse the JSON response
    // The AI might sometimes include markdown code blocks or extra text, so we need to extract just the JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const jsonStr = jsonMatch[0]
    const analysisResult = JSON.parse(jsonStr)

    return {
      success: true,
      data: {
        voice: analysisResult.voice || "No voice analysis available",
        walk: analysisResult.walk || "No walking style analysis available",
        style: analysisResult.style || "No fashion style analysis available",
        personality: analysisResult.personality || "No personality analysis available",
      },
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return {
      success: false,
      error: "Failed to analyze the image. Please try again.",
    }
  }
}
