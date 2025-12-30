'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/src/lib/utils'

interface HealthStatus {
  status: 'checking' | 'healthy' | 'degraded' | 'error'
  redisStatus?: string
  message?: string
  lastCheck?: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.cannycarrot.com'

export function DatabaseHealthIndicator() {
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking' })

  const checkHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`)
      
      if (!response.ok) {
        setHealth({
          status: 'error',
          message: `API returned ${response.status}`,
          lastCheck: new Date().toLocaleTimeString()
        })
        return
      }

      const data = await response.json()
      
      // Parse health data (same structure as mesh router health check)
      const redisStatus = data.redis || 'unknown'
      const isHealthy = redisStatus === 'connected'
      
      // Try a test Redis operation to verify (like mesh router does)
      let verifiedStatus = redisStatus
      if (isHealthy) {
        try {
          const testKey = `health:test:${Date.now()}`
          const testResponse = await fetch(`${apiUrl}/api/v1/redis/setex`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ args: [testKey, 5, 'ok'] }),
          })
          
          if (testResponse.ok) {
            const testResult = await testResponse.json()
            if (testResult.data === 'OK' || testResult.data === true) {
              verifiedStatus = 'connected_and_verified'
            } else {
              verifiedStatus = 'connected_but_error'
            }
          } else {
            verifiedStatus = 'connected_but_error'
          }
        } catch (testError) {
          verifiedStatus = 'connected_but_error'
        }
      }

      // Determine overall status
      let overallStatus: HealthStatus['status'] = 'error'
      let message = 'Unknown status'

      if (verifiedStatus === 'connected_and_verified') {
        overallStatus = 'healthy'
        message = 'Database connected'
      } else if (verifiedStatus === 'connected' || verifiedStatus === 'connected_but_error') {
        overallStatus = 'degraded'
        message = 'Database connected (unverified)'
      } else {
        overallStatus = 'error'
        message = 'Database disconnected'
      }

      setHealth({
        status: overallStatus,
        redisStatus: verifiedStatus,
        message,
        lastCheck: new Date().toLocaleTimeString()
      })
    } catch (error: any) {
      setHealth({
        status: 'error',
        message: error.message || 'Health check failed',
        lastCheck: new Date().toLocaleTimeString()
      })
    }
  }

  useEffect(() => {
    // Initial check
    checkHealth()

    // Check every 10 seconds (same interval as mesh router)
    const interval = setInterval(checkHealth, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (health.status) {
      case 'healthy':
        return 'Online'
      case 'degraded':
        return 'Degraded'
      case 'error':
        return 'Offline'
      default:
        return 'Checking...'
    }
  }

  return (
    <div className="border-t border-[#dadce0] p-3">
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-2 h-2 rounded-full',
          getStatusColor(),
          health.status === 'checking' && 'animate-pulse'
        )} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-[#202124]">
            Database
          </div>
          <div className="text-xs text-[#5f6368] truncate">
            {getStatusText()}
          </div>
          {health.lastCheck && (
            <div className="text-xs text-[#9aa0a6]">
              {health.lastCheck}
            </div>
          )}
        </div>
      </div>
      {health.redisStatus && health.redisStatus !== 'connected_and_verified' && (
        <div className="text-xs text-[#ea4335] mt-1">
          {health.message}
        </div>
      )}
    </div>
  )
}
