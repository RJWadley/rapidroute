import { useContext, useEffect } from "react"

import ImageGallery from "react-image-gallery"
import styled, { keyframes } from "styled-components"

import { darkModeContext } from "components/Providers/DarkMode"
import { MapSearchContext } from "components/Providers/MapSearchContext"
import { defaultPadding } from "map/zoomCamera"
import { setLocal } from "utils/localUtils"
import media from "utils/media"
import useMedia from "utils/useMedia"

import InfoBox from "./wiki/InfoBox"
import useWiki from "./wiki/useWiki"

import "react-image-gallery/styles/css/image-gallery.css"

export default function ItemInformation() {
  const { activeItem } = useContext(MapSearchContext)
  const { value, loading } = useWiki(activeItem)
  const isMobile = useMedia(media.mobile)
  const isDark = useContext(darkModeContext)

  useEffect(() => {
    const newPadding = isMobile
      ? {
          bottom: 200,
          left: 20,
          right: 20,
        }
      : {
          left: 450,
        }

    if (value || loading)
      setLocal("cameraPadding", {
        ...defaultPadding,
        ...newPadding,
      })
    else setLocal("cameraPadding", defaultPadding)
  }, [isMobile, loading, value])

  const carousel = value?.images && (
    <CarouselWrap>
      <ImageGallery
        items={value.images.flatMap(image =>
          image.img
            ? [
                {
                  original: image.img,
                  originalAlt: image.alt,
                },
              ]
            : []
        )}
        showPlayButton={false}
        showFullscreenButton={false}
        autoPlay
        showBullets={value.images.length > 1}
      />
    </CarouselWrap>
  )

  return (
    <>
      {value && !loading && (
        <Wrapper darkBackground={isDark ?? true}>
          {!isMobile && carousel}
          <TextContent>
            <Title>{value.title}</Title>
            {isMobile && carousel}
            <Desc>{value.blurb}</Desc>
            <Link href={value.pageUrl} target="_blank" rel="noreferrer">
              Read more
            </Link>
          </TextContent>
          <InfoBox title={value.title} />
        </Wrapper>
      )}
      {loading && <Loading />}
    </>
  )
}

const CarouselWrap = styled.div`
  background: var(--mid-background);

  @media ${media.mobile} {
    order: 0;
    border-radius: 10px;
    overflow: hidden;
    isolation: isolate;
    width: 100%;
  }

  img {
    width: 100%;
    min-width: 100%;
    height: 200px !important;
    min-height: 200px;

    @media ${media.mobile} {
      height: 50vw !important;
      min-height: 50vw;
    }

    object-fit: cover !important;
    background: var(--mid-background);
    image-rendering: pixelated;
    position: relative;

    /* styles for when the image fails to load */
    ::after {
      content: "Couldn't load image\n"attr(alt);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--mid-background);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 50px;
      white-space: pre-wrap;
      line-height: 1.5em;
    }
  }
`

const Wrapper = styled.div<{
  darkBackground: boolean
}>`
  background: ${({ darkBackground }) =>
    darkBackground ? "var(--default-card-background)" : "white"};
  border-radius: 20px;
  margin-top: 20px;
  isolation: isolate;
  overflow: hidden;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  position: relative;

  svg {
    max-width: 30px;
  }

  @media ${media.mobile} {
    margin-top: calc(100vh - 280px);
    pointer-events: none;
    padding-top: 10px;

    ::before {
      content: "";
      position: absolute;
      top: 5;
      left: 50%;
      transform: translateX(-50%);
      width: 25px;
      height: 5px;
      border-radius: 10px;
      background: var(--dark-background);
    }

    > * {
      pointer-events: auto;
    }
  }
`

const TextContent = styled.div`
  padding: 20px;
  display: grid;
  gap: 15px;
  justify-items: start;
  color: var(--text-color);
  position: relative;
`

const Title = styled.h1`
  font-size: var(--medium);
  font-weight: bold;
`

const Desc = styled.p`
  font-size: var(--extra-small);

  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
`

const Link = styled.a`
  background-color: var(--button-green);
  color: var(--invert-button-green);
  padding: 10px 20px;
  display: block;
  border-radius: 10px;
  font-weight: 600;
  transition: background 0.2s ease-in-out;
`

const pulse = keyframes`
  0% {
    background-position: 40% 0;
  }
  100% {
    background-position: -160% 0;
  }
`

const Loading = styled.div`
  background: linear-gradient(
    to right,
    var(--default-card-background) 0%,
    var(--dark-background) 10%,
    var(--default-card-background) 20%
  );
  background-size: 200% 100%;
  animation: ${pulse} 2s ease infinite;
  border-radius: 20px;
  transition: opacity 0.5s;
  pointer-events: none;
  margin-top: 20px;
  height: 200px;

  @media ${media.mobile} {
    margin-top: calc(100vh - 280px);
    height: 250px;

    ${Wrapper} & {
      margin-top: 20px;
    }
  }
`
