import type { UrlObject } from "node:url"

import type { RedirectType } from "next/dist/client/components/redirect"
import Link from "next/link"
import type { ComponentProps, ElementRef, MouseEventHandler } from "react"

type NextLinkProps = ComponentProps<typeof Link>

/**
 * this makes working with dynamic routes a bit more ergonomic.
 * because dynamic routes are impossible to type without generics,
 * which add a lot of complexity.
 *
 * in reality, this is a string, but typing it as a string would
 * sabotoge our routing type safety.
 *
 * typing it as a constant string maintains our routing safety,
 * while also allowing us to use it as a string. you may have
 * to cast into this type at times in API code
 */
export type DynamicLinkMixin = "dynamicLinkMixin"

type DynamicLinks =
  `${__next_route_internal_types__.DynamicRoutes<DynamicLinkMixin>}${__next_route_internal_types__.Suffix}`

type NextHREF = Exclude<NextLinkProps["href"], UrlObject>
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type ValidLink = DynamicLinks | NextHREF | null

type BaseLinkProps = Omit<NextLinkProps, "href" | "as"> &
  ComponentProps<"button">

interface ButtonProps extends BaseLinkProps {
  /**
   * what should happen when the button is clicked?
   */
  onClick?: MouseEventHandler
  /**
   * what type of button is this?
   */
  type: "submit" | "button" | "reset"
  /**
   * forward a ref to the button
   */
  forwardRef?: React.RefObject<ElementRef<"button">>
  href?: undefined
}

interface AnchorProps extends BaseLinkProps {
  /**
   * where should the link navigate to?
   */
  href: ValidLink
  /**
   * forward a ref to the link or anchor tag
   */
  forwardRef?: React.RefObject<ElementRef<"a">>
  onClick?: undefined
  type?: undefined
}

export type UniversalLinkProps = ButtonProps | AnchorProps

export type UniversalLinkRef = ElementRef<"a"> & ElementRef<"button">

/**
 * to prevent pollution of the DOM, we only want to pass certain props
 */
const propsToPreserve = [
  /^className$/,
  /^key$/,
  /^id$/,
  // keep events
  /^on.*$/,
  // keep accessibility & data
  /^aria.*$/,
  /^role$/,
  /^data.*$/,
]

export default function UniversalLink({
  href,
  children,
  forwardRef,
  type,
  style,
  ...unfilteredProps
}: UniversalLinkProps) {
  const props: Partial<typeof unfilteredProps> = Object.fromEntries(
    Object.entries(unfilteredProps).filter(([key]) =>
      propsToPreserve.some((regex) => regex.test(key)),
    ),
  )

  if (type) {
    return (
      <button
        type={type}
        ref={forwardRef}
        {...props}
        style={{
          cursor: "pointer",
          ...style,
        }}
      >
        {children}
      </button>
    )
  }

  return href ? (
    <Link {...props} href={href} ref={forwardRef} style={style}>
      {children}
    </Link>
  ) : (
    <a {...props} ref={forwardRef} style={style}>
      {children}
    </a>
  )
}

// modify redirect function from 'next/navigation'
// to require a ValidLink. See also the pnpm patch
declare module "next/navigation" {
  export function redirect(
    url: NonNullable<ValidLink>,
    type?: RedirectType,
  ): never
}
