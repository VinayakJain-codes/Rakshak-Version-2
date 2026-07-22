'use client'

import React, { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

export default function CheckInCameraModal({
  scheduleId,
  onClose,
  onSuccess
}: {
  scheduleId: string
  onClose: () => void
  onSuccess: (scheduleId: string) => void
}) {
  const webcamRef = useRef<Webcam>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot()
      setImageSrc(image)
    }
  }, [webcamRef])

  const retake = () => {
    setImageSrc(null)
    setErrorMsg(null)
  }

  const submit = async () => {
    if (!imageSrc) return
    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, imageBase64: imageSrc })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.reason || data.error || 'Verification failed')
      }

      onSuccess(scheduleId)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Identity Verification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col items-center">
          {errorMsg && (
            <div className="mb-4 w-full p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          {!imageSrc ? (
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black mb-4 relative">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-indigo-500/30 border-dashed m-8 rounded-full pointer-events-none" />
              <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70 drop-shadow-md font-medium">
                Position your face inside the frame
              </p>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-black mb-4">
              <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="w-full flex gap-3">
            {!imageSrc ? (
              <button 
                onClick={capture}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Capture Photo
              </button>
            ) : (
              <>
                <button 
                  onClick={retake}
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Retake
                </button>
                <button 
                  onClick={submit}
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : 'Verify & Check In'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
