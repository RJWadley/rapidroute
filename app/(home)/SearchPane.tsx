"use client"

import type { Place } from "@prisma/client"
import SearchBox from "components/SearchBox"
import { useState } from "react"

export default function SearchPane({
  initialPlaces,
}: {
  initialPlaces: Place[]
}) {
  return <SearchBox initialPlaces={initialPlaces} />
}
