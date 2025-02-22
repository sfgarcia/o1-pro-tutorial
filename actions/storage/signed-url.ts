"use server"

import { createClient } from "@supabase/supabase-js"
import { ActionState } from "@/types"

export async function generateSignedUrlStorage(
  filePath: string
): Promise<ActionState<{ url: string }>> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(filePath, 3600) // 1 hour expiration

    if (error) throw error
    
    return {
      isSuccess: true,
      message: "Signed URL generated",
      data: { url: data.signedUrl }
    }
  } catch (error) {
    console.error("Error generating signed URL:", error)
    return {
      isSuccess: false,
      message: "Failed to generate image URL"
    }
  }
}