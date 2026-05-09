import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('app', () => {
  it('renders panel title and actions', () => {
    render(<App />)
    expect(screen.getByText('五子棋 · 人机对战')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '悔棋' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新开始' })).toBeInTheDocument()
  })

  it('allows changing difficulty slider', () => {
    render(<App />)
    const slider = screen.getByLabelText(/AI 深度/)
    fireEvent.change(slider, { target: { value: '3' } })
    expect(screen.getByText(/AI 深度：3/)).toBeInTheDocument()
  })
})
