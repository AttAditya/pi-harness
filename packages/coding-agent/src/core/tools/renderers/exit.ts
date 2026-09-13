import { Text } from "@earendil-works/pi-tui";
import type { ToolDefinition } from "../../extensions/types.ts";

export const exitRenderers: Pick<ToolDefinition<any, any>, "renderCall" | "renderResult"> = {
	renderCall(_rawArgs, theme, _context) {
		const text = (_context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
		text.setText(theme.fg("toolTitle", theme.bold("exit")));
		return text;
	},
	renderResult(_result, options, _theme, context) {
		const text = (context.lastComponent as Text | undefined) ?? new Text("", 0, 0);
		if (!options.expanded) {
			return text;
		}
		return text;
	},
};
