"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, Loader2, Volume2, FootprintsIcon as Walking, Shirt, Brain } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { analyzeCharacterImage } from "./actions"

interface AnalysisResult {
  voice: string
  walk: string
  style: string
  personality: string
}

export default function CharacterProfiler() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      // Check if file is an image
      if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
        setError("Please upload a JPG or PNG image")
        return
      }

      setFile(file)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeCharacter = async () => {
    if (!selectedImage) {
      setError("Please select an image first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Call the server action with the base64 image data
      const response = await analyzeCharacterImage(selectedImage)

      if (response.success && response.data) {
        setResult(response.data)
      } else {
        setError(response.error || "Failed to analyze image. Please try again.")
      }
    } catch (err) {
      console.error("Error analyzing character:", err)
      setError("Failed to analyze image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-blue-50 flex flex-col items-center p-4">
      <header className="w-full max-w-3xl text-center my-8">
        <h1 className="text-3xl font-bold text-lavender-800">Character Persona Profiler</h1>
        <p className="text-lavender-600 mt-2">Powered by Google Gemini AI</p>
      </header>

      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-lavender-700">Character Analysis</CardTitle>
          <CardDescription className="text-center">
            Upload a character image to analyze their persona traits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                  selectedImage ? "border-lavender-400 bg-lavender-50" : "border-gray-300 hover:border-lavender-400",
                )}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                {selectedImage ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected character"
                      className="max-h-64 max-w-full rounded-md object-contain"
                    />
                    <p className="text-sm text-gray-500">Click to change image</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 py-8">
                    <Upload className="h-12 w-12 text-lavender-500" />
                    <div className="space-y-1 text-center">
                      <p className="text-lg font-medium">Upload an image</p>
                      <p className="text-sm text-gray-500">JPG or PNG files only</p>
                    </div>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {error && <div className="text-red-500 text-center text-sm">{error}</div>}

              <div className="flex justify-center">
                <Button
                  onClick={analyzeCharacter}
                  disabled={!selectedImage || isLoading}
                  className="bg-lavender-600 hover:bg-lavender-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing character traits...
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Analyze Character
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-lavender-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Volume2 className="h-5 w-5 text-lavender-600 mr-2" />
                    <h3 className="font-semibold text-lavender-700">Voice Style</h3>
                  </div>
                  <p className="text-gray-700">{result.voice}</p>
                </div>

                <div className="bg-lavender-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Walking className="h-5 w-5 text-lavender-600 mr-2" />
                    <h3 className="font-semibold text-lavender-700">Walking Style</h3>
                  </div>
                  <p className="text-gray-700">{result.walk}</p>
                </div>

                <div className="bg-lavender-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shirt className="h-5 w-5 text-lavender-600 mr-2" />
                    <h3 className="font-semibold text-lavender-700">Fashion Style</h3>
                  </div>
                  <p className="text-gray-700">{result.style}</p>
                </div>

                <div className="bg-lavender-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-lavender-600 mr-2" />
                    <h3 className="font-semibold text-lavender-700">Personality Traits</h3>
                  </div>
                  <p className="text-gray-700">{result.personality}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="border-lavender-300 text-lavender-700 hover:bg-lavender-50"
                >
                  Try Another Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
