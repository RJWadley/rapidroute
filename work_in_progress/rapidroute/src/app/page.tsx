import styles from "./index.module.css"
import SearchBox from "~/components/SearchBox"
import { db } from "~/server/db"

export default async function Home() {
	const places = await db.place.findMany()

	return (
		<main className={styles.main}>
			<div className={styles.sidebar}>
				<SearchBox places={places} />
			</div>
		</main>
	)
}
