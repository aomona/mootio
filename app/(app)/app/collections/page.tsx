import { CardPreview } from "@/components/card-preview";
import { CardRender } from "@/components/card-render";

const UNION_ICON_SRC =
	"https://www.figma.com/api/mcp/asset/cdf654c3-8190-4616-b496-5b41e5395e58";

export default function HomePage() {
	return (
		<>
			<CardPreview gradient="knowledge" unionSrc={UNION_ICON_SRC} />
			<CardRender cardId="abs-rare" />
		</>
	);
}
