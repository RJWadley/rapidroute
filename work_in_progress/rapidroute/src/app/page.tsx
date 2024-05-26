import { styled } from "styled-system/jsx"
import SearchBox from "~/components/SearchBox"
import { db } from "~/server/db"
import styles from "./index.module.css"

const Panda = styled.div`
  color: orange;
`

export default async function Home() {
	const places = await db.place.findMany()

	return (
		<main className={styles.main}>
			<Panda>Hello 🐼!</Panda>
			<div className={styles.sidebar}>
				<SearchBox places={places} />
			</div>
		</main>
	)
}
