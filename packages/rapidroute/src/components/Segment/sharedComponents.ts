import styled, { css } from "styled-components"

import invertLightness from "utils/invertLightness"

export const Wrapper = styled.div<{
  backgroundColor: string
  small: boolean
}>`
  background-color: ${props => props.backgroundColor};
  color: ${props => invertLightness(props.backgroundColor)};
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  padding: 30px;
  border-radius: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
  max-width: calc(100vw - 40px);

  ${({ small }) =>
    small &&
    css`
      grid-template-columns: 1fr;
      gap: 10px;
    `};
`

export const Left = styled.div`
  display: grid;
  gap: 10px;
`

export const ProviderName = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

export const Logo = styled.div<{
  bigLogo: boolean
  background: string
  small: boolean
}>`
  border-radius: 10px;
  background-color: ${({ background }) => background};
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  object-fit: contain;

  img {
    ${props =>
      props.bigLogo
        ? css`
            border-radius: 10px;
          `
        : css`
            margin: 5px;
            width: 50px;
            min-width: 50px;
            height: 50px;
            border-radius: 4px;
          `}
  }

  ${({ small, bigLogo }) =>
    small &&
    css`
      border-radius: 5px;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;

      img {
        ${bigLogo
          ? css`
              border-radius: 5px;
              width: 40px;
              min-width: 40px;
            `
          : css`
              margin: 2.5px;
              width: 35px;
              height: 35px;
              min-width: 35px;
              border-radius: 2px;
            `}
      }
    `}
`

export const Name = styled.div`
  font-weight: 700;
  font-size: var(--medium);
`

export const RouteNumber = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: var(--small);
`

export const LongNames = styled.div`
  font-size: var(--extra-small);
`

export const Symbols = styled.div<{
  singleLine: boolean
}>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  place-items: center;
  justify-content: center;
  max-width: calc(100vw - 100px);
  font-size: var(--extra-large);
  font-weight: 700;
  white-space: pre;
  gap: 10px;

  > div:last-child {
    text-align: right;
  }

  ${({ singleLine }) =>
    singleLine &&
    css`
      > div {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }

      > div:last-child {
        flex-direction: row-reverse;
      }
    `}
`

export const GateNumber = styled.div`
  font-size: var(--small);
  font-weight: 400;
`
