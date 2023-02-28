import Line from "./Line"
import { LineType } from "./markersType"

interface MarkerLinesProps {
  lines: LineType[]
}

function MarkerLine({
  line,
  background = false,
}: {
  line: LineType
  background?: boolean
}) {
  const points = line.x.map((x, i) => ({
    x,
    z: line.z[i],
  }))

  return <Line points={points} color={line.color} background={background} />
}

export default function MarkerLines({ lines }: MarkerLinesProps) {
  return (
    <>
      {lines.map(line => (
        <MarkerLine key={JSON.stringify(line)} line={line} background />
      ))}
      {lines.map(line => (
        <MarkerLine key={JSON.stringify(line)} line={line} />
      ))}
    </>
  )
}
