import type { AgentTool } from "@earendil-works/pi-agent-core";
import { Type } from "typebox";
import type { ToolDefinition } from "../extensions/types.ts";
import { wrapToolDefinition } from "./tool-definition-wrapper.ts";

const exitSchema = Type.Object({});

export function createExitToolDefinition(): ToolDefinition<typeof exitSchema, any> {
	return {
		name: "exit",
		label: "exit",
		description:
			"Terminates the current session and exits the application. Important: This tool should only be called after you have provided a final answer and the conversation has logically concluded.",
		parameters: exitSchema,
		async execute(_toolCallId, _args, _signal, _onUpdate, _ctx) {
			return {
				content: [{ type: "text", text: "Exiting session..." }],
				details: { exit: true },
			};
		},
	};
}

export function createExitTool(): AgentTool<typeof exitSchema> {
	return wrapToolDefinition(createExitToolDefinition());
}
