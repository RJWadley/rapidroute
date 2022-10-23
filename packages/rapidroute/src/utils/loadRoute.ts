import { navigate } from "gatsby-link"

export default function loadRoute(route: string) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  navigate(route)
}
