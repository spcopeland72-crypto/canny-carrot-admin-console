'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/src/lib/utils'

// EXACT COPY from mesh-router/packages/router/src/routes/health.ts lines 34-60
interface HealthStatus {
  redisStatus: string
  redisConnected: boolean
  redisUrlConfigured: boolean
  lastCheck?: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.cannycarrot.com'

export function DatabaseHealthIndicator() {
  const [health, setHealth] = useState<HealthStatus>({ 
    redisStatus: 'not_configured',
    redisConnected: false,
    redisUrlConfigured: false
  })

  const checkHealth = async () => {
    try {
      // EXACT COPY from mesh-router health check logic
      // Check Redis connection status if using RedisQueueManager
      let redisStatus = 'not_configured';
      let redisConnected = false;
      let redisUrlConfigured = false;
      
      // Since we're in admin panel, we check via API server
      // The API server has redisClient similar to mesh router's queue.redis
      const healthResponse = await fetch(`${apiUrl}/health`)
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        redisUrlConfigured = true // API server is configured
        
        // Check if Redis is connected (from API server response)
        if (healthData.redis === 'connected') {
          redisConnected = true
          redisStatus = 'connected'
          
          // Try a test operation to verify (EXACT COPY from mesh router line 49-54)
          try {
            const testResponse = await fetch(`${apiUrl}/api/v1/redis/setex`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ args: ['health:test', 5, 'ok'] }),
            })
            
            if (testResponse.ok) {
              const testResult = await testResponse.json()
              if (testResult.data === 'OK' || testResult.data === true) {
                redisStatus = 'connected_and_verified'
              } else {
                console.error('[Health] Redis test operation failed:', testResult)
                redisStatus = 'connected_but_error'
              }
            } else {
              redisStatus = 'connected_but_error'
            }
          } catch (testError) {
            console.error('[Health] Redis test operation failed:', testError)
            redisStatus = 'connected_but_error'
          }
        } else {
          redisStatus = 'disconnected'
        }
      } else {
        redisStatus = 'error_no_client'
      }

      setHealth({
        redisStatus,
        redisConnected,
        redisUrlConfigured,
        lastCheck: new Date().toLocaleTimeString()
      })
    } catch (error: any) {
      console.error('[Health] Error:', error)
      setHealth({
        redisStatus: 'error',
        redisConnected: false,
        redisUrlConfigured: false,
        lastCheck: new Date().toLocaleTimeString()
      })
    }
  }

  useEffect(() => {
    checkHealth()
    // Check every 10 seconds (same as mesh router)
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    if (health.redisStatus === 'connected_and_verified') return 'bg-green-500'
    if (health.redisStatus === 'connected' || health.redisStatus === 'connected_but_error') return 'bg-yellow-500'
    if (health.redisStatus === 'disconnected' || health.redisStatus === 'error' || health.redisStatus === 'error_no_client') return 'bg-red-500'
    return 'bg-gray-400'
  }

  const getStatusText = () => {
    if (health.redisStatus === 'connected_and_verified') return 'Online'
    if (health.redisStatus === 'connected') return 'Connected'
    if (health.redisStatus === 'connected_but_error') return 'Degraded'
    if (health.redisStatus === 'disconnected') return 'Disconnected'
    if (health.redisStatus === 'error' || health.redisStatus === 'error_no_client') return 'Error'
    return 'Checking...'
  }

  return (
    <div className="border-t border-[#dadce0] p-3">
      <div className="flex items-center gap-2">
        <div className={cn(
          'w-2 h-2 rounded-full',
          getStatusColor(),
          health.redisStatus === 'not_configured' && 'animate-pulse'
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
    </div>
  )
}
