# Spec: Exit Tool Implementation

## Overview
The `exit` tool allows the LLM to programmatically terminate the `pi` session. This is a control-signal tool rather than a data-fetching tool. To ensure a safe exit, the tool triggers a graceful shutdown sequence that restores the terminal state and cleans up session resources.

## 1. Tool Definition
**Location**: `packages/coding-agent/src/core/tools/exit.ts`

- **Name**: `exit`
- **Label**: `exit`
- **Description**: `"Terminates the current session and exits the application. Important: This tool should only be called after you have provided a final answer and the conversation has logically concluded."`
- **Parameters**: Empty object `{}` (no input required).
- **Execution Logic**:
    - The `execute` function should return a result with a specific signal in the `details` object.
    - **Return Value**: 
      ```typescript
      {
          content: [{ type: "text", text: "Exiting session..." }],
          details: { exit: true }
      }
      ```

## 2. Tool Registry Integration
**Location**: `packages/coding-agent/src/core/tools/index.ts`

- **Type Update**: Add `"exit"` to the `ToolName` type.
- **Registry Update**: Add `"exit"` to the `allToolNames` set.
- **Factory Updates**: 
    - Update `createToolDefinition` to call `createExitToolDefinition()`.
    - Update `createTool` to call `createExitTool()`.
    - (Optional) Add to `createAllToolDefinitions` and `createAllTools` records.

## 3. Shutdown Trigger (The Glue)
**Location**: `packages/coding-agent/src/modes/interactive/interactive-mode.ts`

The TUI mode must react to the tool's signal to perform the actual process termination.

- **Event Hook**: Inside `handleEvent(event: AgentSessionEvent)`, specifically within the `case "tool_execution_end"` block.
- **Logic**:
    ```typescript
    if (event.result.details?.exit) {
        await this.shutdown();
    }
    ```

## 4. Safe Shutdown Sequence
The implementation must use the existing `InteractiveMode.shutdown()` method to avoid leaving the terminal in a corrupted state (e.g., raw mode enabled, cursor hidden).

**Sequence executed by `this.shutdown()`**:
1. `this.ui.terminal.drainInput(1000)`: Prevents Kitty protocol leaks.
2. `this.stop()`: Restores terminal cooked mode and shows the cursor.
3. `await this.runtimeHost.dispose()`: Notifies extensions and cleans up session resources.
4. `process.exit(0)`: Terminates the process.

## Verification Plan
1. **LLM Trigger**: Prompt the LLM to "finish the task and then exit". Verify the tool is called and the process terminates.
2. **Terminal State**: Verify that the terminal returns to a normal state (cursor visible, input behaving normally) after the exit.
3. **Cleanup**: Verify that `session_shutdown` events are emitted to active extensions.
