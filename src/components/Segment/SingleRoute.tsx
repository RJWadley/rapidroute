import React, { useMemo, useState } from "react"

import styled from "styled-components"

import { SegmentType } from "components/createSegments"
import { getPath } from "data/getData"
import { Provider } from "types"

interface SegmentProps {
  segment: SegmentType
}

export default function SingleRoute({ segment }: SegmentProps) {
  const [provider, setProvider] = useState<Provider | null>(null)
  const route = segment.routes[0]

  useMemo(() => {
    if (route?.provider)
      getPath("providers", route.provider).then(newProvider => {
        if (newProvider) setProvider(newProvider)
      })
  }, [route])

  const image =
    route?.type === "MRT"
      ? "https://www.minecartrapidtransit.net/wp-content/uploads/2015/01/logo.png"
      : provider?.logo

  return (
    <Wrapper themeColor={provider?.color?.light ?? "red"}>
      <ProviderName>
        {image && <Image src={image} alt={`${provider?.name} logo`} />}{" "}
        <Name>{provider?.name}</Name>
      </ProviderName>
      <div>
        {segment.from.shortName} -&gt; {segment.to.shortName}
      </div>
      <div>
        {segment.to.shortName} - {segment.to.name}
      </div>
      <div>{segment.routes[0]?.provider ?? "walk"}</div>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ themeColor: string }>`
  font-family: Inter;
  background-color: ${props => props.themeColor};
`

const ProviderName = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const Image = styled.img`
  max-height: 60px;
  max-width: 60px;
`

const Name = styled.div`
  font-weight: 100;
`
