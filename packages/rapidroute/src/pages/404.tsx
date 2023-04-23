import Header from "components/Header"
import Layout from "components/Layout"
import RoundButton from "components/RoundButton"
import Seo from "components/SEO"
import styled, { keyframes } from "styled-components"
import invertLightness from "utils/invertLightness"

export default function NotFoundPage() {
  return (
    <Layout>
      <Header />
      <Content>
        <Numbers>
          <div>404</div>
          <div>404</div>
          <div>404</div>
          <div>404</div>
          <div>404</div>
        </Numbers>
        <div>Page Not Found</div>
        <Wrapper>
          <div>Take me home</div>
          <RoundButton to="/">home</RoundButton>
        </Wrapper>
      </Content>
    </Layout>
  )
}

export function Head() {
  return <Seo />
}

const Content = styled.div`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 100px;
  font-size: var(--large);
  font-weight: 600;
`

const marquee = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
`

const Numbers = styled.div`
  font-size: 400px;
  display: flex;
  color: var(--default-card-background);
  position: absolute;
  z-index: -1;
  max-width: 100vw;
  overflow: hidden;

  > div {
    animation: ${marquee} 10s linear infinite;
    padding-right: 150px;
  }
`

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
  width: 70vw;
  max-width: calc(100vw - 40px);
`
