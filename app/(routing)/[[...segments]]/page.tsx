/**
 * I want to preserve the page so that I can use motion/react for the transitions
 * which means I can't use different pages/routes for different views.
 *
 * hopefully next will support that in the future, but for now
 * I'm using a layout to render persistent content, then getting route segments
 * manually from next's useParams hook
 *
 * see ../layout.tsx for this page's content
 */
export default function SegmentPage() {
	return null
}
