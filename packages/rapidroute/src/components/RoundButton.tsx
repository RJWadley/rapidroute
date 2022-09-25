import React, { MouseEventHandler, ReactNode } from "react"

import styled from "styled-components"

import media from "utils/media"

interface RoundButtonProps {
  onClick: MouseEventHandler<HTMLButtonElement>
  children: ReactNode
  flipped?: boolean
  className?: string
}

export default function RoundButton({
  onClick,
  children,
  flipped = true,
  className = "",
}: RoundButtonProps) {
  return (
    <StyledButton className={className} onClick={onClick} flipped={flipped}>
      <span>{children}</span>
    </StyledButton>
  )
}

const StyledButton = styled.button<{ flipped: boolean }>`
  display: grid;
  place-items: center;
  font-family: "Material Icons";
  background-color: #7cd48a;
  cursor: pointer;
  span {
    rotate: ${props => (props.flipped ? "180deg" : "0deg")};
    transition: rotate 0.5s ease-in-out;
  }
  width: 80px;
  height: 80px;
  border-radius: 20px;
  font-size: 70px;
  overflow: hidden;

  @media ${media.mobile} {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    font-size: 40px;
  }
`
