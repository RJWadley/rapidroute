import { NavigationContext } from "components/Providers/NavigationContext"
import RoundButton from "components/RoundButton"
import { SegmentType } from "components/Segment/createSegments"
import { useContext } from "react"
import styled from "styled-components"
import invertLightness from "utils/invertLightness"
import { loadPage } from "utils/Loader/TransitionUtils"

interface BeginNavigationProps {
  route: string[]
  segments: SegmentType[] | null
}

/**
 * green "begin navigation" button
 * starts the navigation process when clicked
 */
export default function BeginNavigation({
  route,
  segments,
}: BeginNavigationProps) {
  const {
    setPreferredRoute,
    setCurrentRoute,
    setNavigationComplete,
    setSpokenRoute,
  } = useContext(NavigationContext)

  return (
    <Wrapper>
      <Text>
        Begin <Strong>Navigation</Strong>
      </Text>
      <RoundButton
        onClick={() => {
          setPreferredRoute(route)
          if (segments) setCurrentRoute(segments)
          setNavigationComplete(false)
          setSpokenRoute([])
          loadPage("/navigate", "slide").catch(console.error)
        }}
      >
        directions_alt
      </RoundButton>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--background-green);
  color: ${invertLightness("var(--background-green)")};
  border-radius: 30px;
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 30px;
  align-items: center;
  justify-content: center;
  transform: translate(0, 200px);
  opacity: 0;
  max-width: calc(100vw - 40px);
`

const Text = styled.div`
  font-size: var(--medium);
`

const Strong = styled.strong`
  font-weight: 700;
`
