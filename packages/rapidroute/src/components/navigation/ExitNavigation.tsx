import { NavigationContext } from "components/Providers/NavigationContext"
import { useContext, useEffect, useRef } from "react"
import styled from "styled-components"
import UniversalLink from "utils/Loader/UniversalLink"
import media from "utils/media"

export default function ExitNavigation() {
  const { currentRoute, setHeaderHeight } = useContext(NavigationContext)
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHeaderHeight(wrapper.current?.clientHeight ?? 80)
  })

  const destination = currentRoute[currentRoute.length - 1]?.to
  return (
    <Wrapper ref={wrapper}>
      <ExitButton to="/" transition="slide">
        &times;
      </ExitButton>
      <Text>
        <Head>Navigation to {destination?.shortName}</Head>
        <Sub>{destination?.name}</Sub>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--glassy-default-card-background);
  border-radius: 25px;
  backdrop-filter: blur(3px);

  position: fixed;
  z-index: 3;
  top: 20px;

  width: 350px;
  min-height: 80px;
  padding: 15px;
  padding-right: 25px;
  display: grid;
  grid-template-columns: auto 1fr;

  @media ${media.mobile} {
    width: calc(100vw - 40px);
    margin-bottom: 60vh;
  }

  // if using window controls overlay, move down
  @media (display-mode: window-controls-overlay) {
    transform: translateY(env(titlebar-area-height, 40px));
  }
`

const ExitButton = styled(UniversalLink)`
  font-size: 40px;
  line-height: 46px;
  font-weight: bold;
  background-color: var(--button-red);
  color: var(--invert-button-red);
  width: 50px;
  height: 50px;
  border-radius: 15px;
  display: flex;
  justify-content: center;
  margin-right: 12px;
`

const Text = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
`

const Head = styled.div`
  font-size: 24px;
  font-weight: bold;
`

const Sub = styled.div`
  font-size: 12px;
`
