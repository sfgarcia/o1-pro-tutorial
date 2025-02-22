"use server"

/**
 * @description
 * Server action for processing receipts through GPT-4 Vision API.
 * Handles image processing, AI extraction, and data validation.
 * 
 * Workflow:
 * 1. Download image from Supabase storage
 * 2. Convert to base64
 * 3. Send to GPT-4 Vision API with structured prompt
 * 4. Validate and sanitize response
 * 5. Return standardized result
 * 
 * @error_handling
 * - Retries failed API calls 3 times
 * - Validates both API response and data schema
 * - Handles corrupted images and API limits
 */

import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { ReceiptSchema, ReceiptData } from "@/lib/receipt-schema"
import { ActionState } from "@/types"

const MAX_RETRIES = 3
const GPT_MODEL = "gpt-4-vision-preview"

type ProcessReceiptInput = {
  filePath: string
  userId: string
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function processReceiptAction(
  input: ProcessReceiptInput
): Promise<ActionState<ReceiptData>> {
  try {
    // Download image from Supabase
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("receipts")
      .download(input.filePath)

    if (downloadError || !fileData) {
      throw new Error("Failed to download receipt image")
    }

    // Convert to base64
    const buffer = await fileData.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString("base64")

    // Process with GPT-4 Vision
    const completion = await openai.chat.completions.create({
      model: GPT_MODEL,
      max_tokens: 1000,
      temperature: 0.2,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: await getSystemPrompt()
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
              detail: "high"
            }
          }
        ]
      }]
    }, { maxRetries: MAX_RETRIES })

    // Extract JSON from response
    const rawResponse = completion.choices[0].message.content
    const jsonString = rawResponse?.match(/\{[\s\S]*\}/)?.[0] || ""
    
    try {
      const parsedData = JSON.parse(jsonString)
      const validatedData = ReceiptSchema.parse({
        ...parsedData,
        date: parsedData.date ? new Date(parsedData.date) : new Date()
      })

      return {
        isSuccess: true,
        message: "Receipt processed successfully",
        data: validatedData
      }
    } catch (validationError) {
      console.error("Validation failed:", validationError)
      return {
        isSuccess: false,
        message: "AI returned invalid data format"
      }
    }
  } catch (error) {
    console.error("Processing error:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? error.message 
        : "Failed to process receipt"
    }
  }
}

async function getSystemPrompt(): Promise<string> {
  try {
    const response = await fetch(
      "file:./prompts/receipt-extraction.txt"
    )
    return await response.text()
  } catch {
    return "Analyze receipt image and return JSON with date, merchant, amount, items, and category"
  }
}