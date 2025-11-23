'use client'

import { useState, useEffect, useRef } from 'react'

interface TimerProps {
  initialSeconds?: number
  presetMinutes?: number | null
  onComplete?: () => void
}

export default function Timer({ initialSeconds, presetMinutes, onComplete }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds || presetMinutes ? presetMinutes! * 60 : 0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (presetMinutes && !initialSeconds) {
      setSeconds(presetMinutes * 60)
    }
  }, [presetMinutes, initialSeconds])

  useEffect(() => {
    if (isRunning && !isPaused && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            playAlert()
            if (onComplete) onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, seconds, onComplete])

  const playAlert = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (seconds > 0) {
      setIsRunning(true)
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    setIsPaused(true)
    setIsRunning(false)
  }

  const handleResume = () => {
    setIsPaused(false)
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (presetMinutes) {
      setSeconds(presetMinutes * 60)
    } else if (initialSeconds) {
      setSeconds(initialSeconds)
    } else {
      setSeconds(0)
    }
  }

  const handlePreset = (minutes: number) => {
    setSeconds(minutes * 60)
    setIsRunning(false)
    setIsPaused(false)
  }

  const handleCustomTime = (minutes: number, secs: number = 0) => {
    setSeconds(minutes * 60 + secs)
    setIsRunning(false)
    setIsPaused(false)
  }

  const presets = [5, 10, 15, 25, 30, 45, 60]

  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: '#2b2b2b' }}
    >
      <h3 className="mb-4 text-lg font-semibold text-white">Timer</h3>

      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full text-4xl font-bold text-white"
          style={{ backgroundColor: '#242424' }}
        >
          {formatTime(seconds)}
        </div>
      </div>

      <div className="mb-4 flex justify-center gap-2">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStart}
            disabled={seconds === 0}
            className="rounded-md px-4 py-2 font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#01eab9' }}
          >
            Start
          </button>
        )}
        {isRunning && (
          <button
            onClick={handlePause}
            className="rounded-md px-4 py-2 font-medium text-white"
            style={{ backgroundColor: '#ff7800' }}
          >
            Pause
          </button>
        )}
        {isPaused && (
          <>
            <button
              onClick={handleResume}
              className="rounded-md px-4 py-2 font-medium text-white"
              style={{ backgroundColor: '#01eab9' }}
            >
              Resume
            </button>
            <button
              onClick={handleReset}
              className="rounded-md px-4 py-2 font-medium text-white"
              style={{ backgroundColor: '#242424' }}
            >
              Reset
            </button>
          </>
        )}
        {!isRunning && !isPaused && seconds > 0 && (
          <button
            onClick={handleReset}
            className="rounded-md px-4 py-2 font-medium text-white"
            style={{ backgroundColor: '#242424' }}
          >
            Reset
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Presets (minutes)</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className="rounded-md px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: '#9a86ff' }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Custom Time</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="59"
            placeholder="Minutes"
            className="w-24 rounded-md px-3 py-2 text-white"
            style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const minutes = parseInt((e.target as HTMLInputElement).value) || 0
                handleCustomTime(minutes)
              }
            }}
          />
          <input
            type="number"
            min="0"
            max="59"
            placeholder="Seconds"
            className="w-24 rounded-md px-3 py-2 text-white"
            style={{ backgroundColor: '#242424', border: '1px solid #3a3a3a' }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const minutesInput = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                const minutes = parseInt(minutesInput.value) || 0
                const seconds = parseInt((e.target as HTMLInputElement).value) || 0
                handleCustomTime(minutes, seconds)
              }
            }}
          />
          <button
            onClick={() => {
              const minutesInput = document.querySelector('input[placeholder="Minutes"]') as HTMLInputElement
              const secondsInput = document.querySelector('input[placeholder="Seconds"]') as HTMLInputElement
              const minutes = parseInt(minutesInput?.value) || 0
              const seconds = parseInt(secondsInput?.value) || 0
              handleCustomTime(minutes, seconds)
            }}
            className="rounded-md px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: '#01aaff' }}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  )
}

