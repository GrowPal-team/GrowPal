'use client'

import { useEffect, useRef } from 'react'
import { createNoise3D } from 'simplex-noise'

class V2 {
  x: number
  y: number
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  add(v: V2) {
    this.x += v.x
    this.y += v.y
  }
  reset(x: number, y: number) {
    this.x = x
    this.y = y
  }
  lerp(v: V2, n: number) {
    this.x += (v.x - this.x) * n
    this.y += (v.y - this.y) * n
  }
}

class Particle {
  position: V2
  velocity: V2
  acceleration: V2
  alpha: number
  color: string
  points: V2[]

  constructor() {
    this.position = new V2(-100, -100)
    this.velocity = new V2()
    this.acceleration = new V2()
    this.alpha = 0
    this.color = '#2F6F4E'
    this.points = [
      new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
      new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
      new V2(-10 + Math.random() * 20, -10 + Math.random() * 20),
    ]
  }

  update() {
    this.velocity.add(this.acceleration)
    this.position.add(this.velocity)
    this.acceleration.reset(0, 0)
    this.alpha -= 0.008
    if (this.alpha < 0) this.alpha = 0
  }

  follow(forces: V2[], width: number, height: number) {
    const x = Math.floor(this.position.x / 20)
    const y = Math.floor(this.position.y / 20)
    const cols = Math.floor(width / 20)
    const rows = Math.floor(height / 20)
    const index = x * rows + y
    const force = forces[index]
    if (force) this.acceleration.add(force)
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.moveTo(
      this.position.x + this.points[0].x,
      this.position.y + this.points[0].y
    )
    ctx.lineTo(
      this.position.x + this.points[1].x,
      this.position.y + this.points[1].y
    )
    ctx.lineTo(
      this.position.x + this.points[2].x,
      this.position.y + this.points[2].y
    )
    ctx.closePath()
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

export function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const noise3D = createNoise3D()
    let width = 0
    let height = 0
    const forces: V2[] = []
    const particles: Particle[] = []
    const nParticles = 150
    let p = 0
    let animationId: number

    const mouse = new V2(window.innerWidth / 2, window.innerHeight / 2)
    const emitter = new V2(window.innerWidth / 2, window.innerHeight / 2)

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      forces.length = 0
      let i = 0
      for (let x = 0; x < width; x += 20) {
        for (let y = 0; y < height; y += 20) {
          forces[i] = new V2()
          i++
        }
      }
    }

    const updateForces = (t: number) => {
      let i = 0
      let xOff = 0
      let yOff = 0
      for (let x = 0; x < width; x += 20) {
        xOff += 0.1
        for (let y = 0; y < height; y += 20) {
          yOff += 0.1
          const a =
            noise3D(xOff, yOff, t * 0.00005) * Math.PI * 4
          if (forces[i]) forces[i].reset(Math.cos(a) * 0.1, Math.sin(a) * 0.1)
          i++
        }
      }
    }

    const launchParticle = () => {
      particles[p].position.reset(emitter.x, emitter.y)
      particles[p].velocity.reset(-1 + Math.random() * 2, -1 + Math.random() * 2)
      particles[p].color = `hsl(${150 + Math.random() * 40}, 50%, ${50 + Math.random() * 20}%)`
      particles[p].alpha = 1
      p++
      if (p === nParticles) p = 0
    }

    const updateEmitter = () => {
      emitter.lerp(mouse, 0.2)
    }

    const animate = (t: number) => {
      ctx.clearRect(0, 0, width, height)
      updateEmitter()
      launchParticle()
      launchParticle()
      updateForces(t)
      for (let i = 0; i < nParticles; i++) {
        particles[i].update()
        particles[i].follow(forces, width, height)
        particles[i].draw(ctx)
      }
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    const pointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        mouse.x = e.touches[0].pageX
        mouse.y = e.touches[0].pageY
      } else {
        mouse.x = e.pageX
        mouse.y = e.pageY
      }
    }

    resize()
    for (let i = 0; i < nParticles; i++) {
      particles.push(new Particle())
      particles[i].velocity.y = 0.1
    }

    animationId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', pointerMove)
    window.addEventListener('touchmove', pointerMove, { passive: true })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', pointerMove)
      window.removeEventListener('touchmove', pointerMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ background: 'transparent' }}
      width={typeof window !== 'undefined' ? window.innerWidth : 1920}
      height={typeof window !== 'undefined' ? window.innerHeight : 1080}
      aria-hidden
      suppressHydrationWarning
    />
  )
}
