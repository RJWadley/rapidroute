"use client"

import type { WikiContent, WikiProgress } from "app/api/getWikiContent/types"
import { theme } from "app/utils/theme"
import Image from "next/image"
import { type CSSProperties, useState } from "react"
import DangerouslyRenderArticle from "./DangerouslyRenderArticle"
import styles from "./WikiGuide.module.css"

const colors = {
	"--wiki-muted": theme.cardTextMuted,
	"--wiki-border": theme.cardActive,
	"--wiki-surface": theme.cardHover,
	"--wiki-accent": theme.controlHeadingText,
	"--wiki-accent-surface": theme.controlHeadingBackground,
	"--wiki-skeleton": theme.loaderPulse,
} as CSSProperties

function ExternalArrow() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path d="M4 12 12 4M4 4h8v8" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	)
}

export function WikiControls({
	name,
	enabled,
	onChange,
}: {
	name: string
	enabled: boolean | null
	onChange: (enabled: boolean) => void
}) {
	return (
		<div className={styles.controls} style={colors}>
			<label className={styles.overviewToggle}>
				<input
					type="checkbox"
					checked={enabled === true}
					disabled={enabled === null}
					onChange={(event) => onChange(event.currentTarget.checked)}
				/>
				<span>Generated overviews</span>
			</label>
			<a
				className={styles.textLink}
				href={`https://wiki.minecartrapidtransit.net/index.php/Special:Search?search=${encodeURIComponent(name)}`}
				target="_blank"
				rel="noreferrer"
			>
				Search MRT Wiki <ExternalArrow />
			</a>
		</div>
	)
}

function ResearchStatus({ progress }: { progress?: WikiProgress }) {
	const labels = {
		searching: "Finding the right wiki article",
		reading: "Reading the wiki",
		images: "Looking at photos",
		summarizing: "Connecting the details",
		fallback: "Opening the original article",
	}
	return (
		<output className={styles.researchStatus} aria-live="polite">
			<span className={styles.spinner} aria-hidden="true" />
			<span>
				<span className={styles.statusLabel}>
					{progress ? labels[progress.stage] : "Connecting to the MRT wiki"}
				</span>
				{progress?.stage === "reading" && progress.article ? (
					<span className={styles.statusDetail}>{progress.article}</span>
				) : (
					<span className={styles.statusDetail}>
						Putting together a guide to this place.
					</span>
				)}
			</span>
		</output>
	)
}

export function WikiLoading({
	name,
	progress,
	mode = "generated",
}: { name: string; progress?: WikiProgress; mode?: "generated" | "wiki" }) {
	return (
		<section
			className={`${styles.guide} ${styles.loading}`}
			style={colors}
			aria-label={`About ${name}`}
		>
			<p className={styles.eyebrow}>MRT WIKI</p>
			<h2 className={styles.title}>{name}</h2>
			{mode === "wiki" ? (
				<output className={styles.researchStatus} aria-live="polite">
					<span className={styles.spinner} aria-hidden="true" />
					<span className={styles.statusLabel}>Loading the wiki article…</span>
				</output>
			) : (
				<ResearchStatus progress={progress} />
			)}
			<div className={styles.skeleton} aria-hidden="true">
				<span />
				<span />
				<span />
			</div>
			<p className={styles.loadingFootnote}>
				{mode === "wiki"
					? "From the original MRT Wiki article."
					: progress?.pagesRead
						? `${progress.pagesRead} ${progress.pagesRead === 1 ? "article" : "articles"} read${progress.imagesChecked ? ` · ${progress.imagesChecked} ${progress.imagesChecked === 1 ? "image" : "images"} checked` : ""}`
						: "A short overview, with links to the original sources."}
			</p>
		</section>
	)
}

function WikiPhoto({ data }: { data: WikiContent }) {
	const [failed, setFailed] = useState(false)
	if (!data.mostProminentImage || failed) return null
	return (
		<figure className={styles.figure}>
			<div className={styles.photo}>
				<Image
					src={data.mostProminentImage}
					alt={data.imageSource?.description || data.title}
					fill
					loading="eager"
					sizes="(max-width: 400px) 100vw, 390px"
					unoptimized
					style={{ objectFit: "cover" }}
					onError={() => setFailed(true)}
				/>
			</div>
			{data.imageSource && (
				<figcaption className={styles.photoCredit}>
					<a
						href={data.imageSource.url}
						target="_blank"
						rel="noreferrer"
						title={data.imageSource.file}
					>
						Photo source <ExternalArrow />
					</a>
				</figcaption>
			)}
		</figure>
	)
}

export function WikiResult({
	data,
	name,
	retrying = false,
	onRetry,
	progress,
	mode = "generated",
}: {
	data: WikiContent
	name: string
	retrying?: boolean
	onRetry?: () => void
	progress?: WikiProgress
	mode?: "generated" | "wiki"
}) {
	const [expanded, setExpanded] = useState(false)
	const ambiguous = data.match === "ambiguous"
	return (
		<section
			className={styles.guide}
			style={colors}
			aria-label={`About ${name}`}
		>
			<WikiPhoto key={data.mostProminentImage} data={data} />
			<div className={styles.body}>
				<div className={styles.heading}>
					<p className={styles.eyebrow}>
						{mode === "wiki"
							? "FROM THE MRT WIKI"
							: data.synopsis && !ambiguous
								? "GENERATED OVERVIEW · MRT WIKI"
								: "MRT WIKI"}
					</p>
					<h2 className={styles.title}>{data.title}</h2>
				</div>
				{data.type === "generic" && (
					<p className={styles.notice}>
						{ambiguous
							? `Several places share the name ${name}. Check the article below to find the one you mean.`
							: data.match === "related"
								? `Related article for ${name}.`
								: `Wiki search result for ${name}.`}
					</p>
				)}
				{data.synopsis ? (
					<p
						className={`${styles.overview} ${mode === "wiki" ? styles.introduction : ""}`}
					>
						{data.synopsis}
					</p>
				) : (
					<div className={styles.unavailable}>
						<p>
							{mode === "wiki"
								? "This article has no introduction. You can read the full wiki article below."
								: "The overview isn't available right now. You can still read the original wiki article below."}
						</p>
						{mode === "generated" && onRetry && (
							<button
								className={styles.button}
								type="button"
								onClick={onRetry}
								disabled={retrying}
							>
								{retrying ? "Trying again…" : "Try the overview again"}
							</button>
						)}
					</div>
				)}
				{retrying && <ResearchStatus progress={progress} />}
				{mode === "generated" &&
					!ambiguous &&
					data.highlights &&
					data.highlights.length > 0 && (
						<dl className={styles.highlights}>
							{data.highlights.map((highlight, index) => (
								<div
									key={`${highlight.label}-${index}`}
									className={styles.highlight}
								>
									<dt>{highlight.label}</dt>
									<dd>
										{highlight.detail}
										<span className={styles.citations}>
											{highlight.sources.map((source) => (
												<a
													key={source.url}
													href={source.url}
													target="_blank"
													rel="noreferrer"
													aria-label={`Source for ${highlight.label}: ${source.title}`}
													title={source.title}
												>
													<ExternalArrow />
												</a>
											))}
										</span>
									</dd>
								</div>
							))}
						</dl>
					)}
				<div className={styles.sources}>
					<h3>{mode === "wiki" ? "Read on the wiki" : "Read the sources"}</h3>
					<div className={styles.sourceLinks}>
						{data.sources.map((source) => (
							<a
								key={source.url}
								href={source.url}
								target="_blank"
								rel="noreferrer"
							>
								{source.title} <ExternalArrow />
							</a>
						))}
					</div>
				</div>
				{data.content && (
					<details
						className={styles.article}
						open={expanded}
						onToggle={(event) => setExpanded(event.currentTarget.open)}
					>
						<summary>
							<span>Full wiki article</span>
							<svg
								width="18"
								height="18"
								viewBox="0 0 16 16"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="m4 6 4 4 4-4"
									stroke="currentColor"
									strokeWidth="1.5"
								/>
							</svg>
						</summary>
						{expanded && (
							<div className={styles.articleBody}>
								<DangerouslyRenderArticle content={data.content} />
							</div>
						)}
					</details>
				)}
				<p className={styles.attribution}>
					Wiki content by MRT Wiki contributors ·{" "}
					<a
						href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
						target="_blank"
						rel="noreferrer"
					>
						CC BY-NC-SA 3.0
					</a>
				</p>
			</div>
		</section>
	)
}

export function WikiEmpty({
	name,
	error = false,
	onRetry,
	mode = "generated",
}: {
	name: string
	error?: boolean
	onRetry?: () => void
	mode?: "generated" | "wiki"
}) {
	return (
		<section
			className={`${styles.guide} ${styles.empty}`}
			style={colors}
			aria-label={`About ${name}`}
		>
			<p className={styles.eyebrow}>MRT WIKI</p>
			<h2 className={styles.title}>
				{error
					? mode === "wiki"
						? "Couldn't load this wiki article"
						: "Couldn't load this guide"
					: "No wiki article found"}
			</h2>
			<p className={styles.overview}>
				{error
					? `We couldn't look up ${name} right now.`
					: `We couldn't find a matching article for ${name}. You can try a different name on the wiki.`}
			</p>
			<div className={styles.emptyActions}>
				{onRetry && (
					<button className={styles.button} type="button" onClick={onRetry}>
						Try again
					</button>
				)}
				<a
					className={styles.textLink}
					href={`https://wiki.minecartrapidtransit.net/index.php/Special:Search?search=${encodeURIComponent(name)}`}
					target="_blank"
					rel="noreferrer"
				>
					Search the wiki <ExternalArrow />
				</a>
			</div>
		</section>
	)
}
