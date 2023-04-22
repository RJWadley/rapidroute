import styled from "styled-components"
import UniversalLink, { UniversalLinkProps } from "utils/Loader/UniversalLink"
import media from "utils/media"

interface RoundButtonProps extends UniversalLinkProps {
  flipped?: boolean
}

export default function RoundButton({
  children,
  flipped = false,
  ...props
}: RoundButtonProps) {
  return (
    <StyledButton flipped={flipped} {...props}>
      <span>{children}</span>
    </StyledButton>
  )
}

const StyledButton = styled(UniversalLink)<{ flipped: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  background-color: var(--button-green);
  color: var(--invert-button-green);
  cursor: pointer;
  * {
    rotate: ${props => (props.flipped ? "180deg" : "0deg")};
    transition: rotate 0.5s ease-in-out;
    height: 80px;
    pointer-events: none;
  }
  width: 80px;
  height: 80px;
  border-radius: 20px;
  font-size: var(--symbol);
  line-height: 80px;
  overflow: hidden;

  @media ${media.mobile} {
    width: 50px;
    height: 50px;
    * {
      height: 50px;
    }
    border-radius: 15px;
    line-height: 50px;
  }
`
