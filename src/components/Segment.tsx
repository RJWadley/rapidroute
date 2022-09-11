import React from "react";

import { SegmentType } from "./createSegments";

interface SegmentProps {
  segment: SegmentType;
}

export default function Segment({ segment }: SegmentProps) {
  return (
    <div>
      <br />
      <div>
        {segment.from.shortName} - {segment.from.name}
      </div>
      <div>
        {segment.to.shortName} - {segment.to.name}
      </div>
      <div>{segment.routes[0]?.provider ?? "walk"}</div>
      <br />
    </div>
  );
}
