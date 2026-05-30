import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  /** Rendered if the wrapped model throws (e.g. the asset fails to load). */
  readonly fallback: ReactNode
  readonly children: ReactNode
}

interface State {
  readonly failed: boolean
}

/** Falls back to the procedural body if the realistic anatomy model errors. */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
