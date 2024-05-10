import SearchResult from "temp/components/SearchResult"
import type { PlaceSearchItem } from "temp/components/TraditionalSelection/usePlaceSearch"
import media from "temp/utils/media"
import { styled } from "@linaria/react"

interface SearchListProps {
	items: PlaceSearchItem[] | undefined
	focusedItem: PlaceSearchItem | undefined
	selectItem: (index: PlaceSearchItem) => void
}

export default function SearchList({
	items,
	focusedItem,
	selectItem,
}: SearchListProps): JSX.Element {
	return (
		<>
			{items !== undefined && (
				<Wrapper>
					{items.map((place) => (
						<SearchResult
							item={place}
							key={place.id}
							setItem={selectItem}
							selected={focusedItem?.id === place.id}
						/>
					))}
					{items.length === 0 && <div>No Results</div>}
				</Wrapper>
			)}
		</>
	)
}

const Wrapper = styled.div`
	max-width: 1000px;
	margin: 0 auto;
	background-color: var(--mid-background);
	padding: 30px;
	padding-top: 130px;
	border-radius: 30px;
	display: grid;
	font-size: var(--extra-small);
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: -2;

	@media ${media.mobile} {
		padding: 15px;
		padding-top: 40px;
		border-radius: 25px;
		transform: translateY(-25px);
	}
`
