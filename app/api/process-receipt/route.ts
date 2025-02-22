import { processReceiptAction } from "@/actions/process-receipt"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { filePath, userId } = await request.json()

    if (!filePath || !userId) {
      return NextResponse.json(
        { isSuccess: false, message: "Missing required parameters" },
        { status: 400 }
      )
    }

    const result = await processReceiptAction({ filePath, userId })

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { isSuccess: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
