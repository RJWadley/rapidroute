import React, { MouseEventHandler } from "react"

import { Link } from "gatsby"

import { Transitions } from "."
import { loadPage } from "./TransitionUtils"

export interface UniversalLinkProps {
  /**
   * the page to navigate to when clicked
   */
  to: string
  /**
   * the transition to use when navigating
   */
  transition: Transitions
  openInNewTab?: boolean
  children: React.ReactNode
  className?: string
  onMouseEnter?: MouseEventHandler
  onMouseLeave?: MouseEventHandler
  onClick?: MouseEventHandler
  forwardRef?: React.Ref<HTMLAnchorElement & HTMLButtonElement & Link<unknown>>
}

/**
 * a link that navigates when clicked, using the specified transition
 * @returns
 */
export default function UniversalLink({
  to,
  transition,
  openInNewTab = false,
  children,
  className = "",
  onMouseEnter = undefined,
  onMouseLeave = undefined,
  onClick = undefined,
  forwardRef = undefined,
}: UniversalLinkProps) {
  const handleClick: React.MouseEventHandler = e => {
    e.preventDefault()
    if (onClick) onClick(e)

    if (openInNewTab) {
      window.open(to, "_blank")
    } else {
      loadPage(to, transition).catch((err: string) => {
        throw new Error(err)
      })
    }
  }

  const internal = /^\/(?!\/)/.test(to)

  return internal ? (
    <Link
      to={to}
      onClick={handleClick}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={forwardRef}
    >
      {children}
    </Link>
  ) : (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={forwardRef}
    >
      {children}
    </a>
  )
}
