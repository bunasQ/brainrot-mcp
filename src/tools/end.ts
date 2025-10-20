import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import { localhostServer } from "../utils/localhost-server.js";

const UI_TOOL_NAME = "brainrot_end";
const UI_TOOL_DESCRIPTION = `
"IMPORTANT: It's a tool that helps user exit focus mode when the work is done. You MUST CALL THIS TOOL when you finish your work and want to end the conversation with a user.
When you complete all tasks, fix all bugs, finish all features, or complete any work requested by the user, you MUST CALL THIS TOOL.
When user says goodbye, thanks, or indicates the conversation is ending, you MUST CALL THIS TOOL.
IT'S VERY IMPORTANT TO CALL THIS TOOL BECAUSE IT WILL PROPERLY CLOSE THE FOCUS SESSION.
THIS TOOL DOESN'T BLOCK THE CONVERSATION, IT'S JUST A TOOL TO CLEAN UP THE FOCUS SESSION, SO IT MUST BE CALLED WHEN ENDING THE CONVERSATION."

CALL IT BEFORE YOU FINISH YOUR WORK. YOU MUST CALL IT BEFORE YOU FINISH YOUR WORK.

IT'S REALLY IMPORTANT THIS TOOL MUST BE CALLED IF YOU CALLED brainrot_start TOOL
`;

export class EndTool extends BaseTool {
  name = UI_TOOL_NAME;
  description = UI_TOOL_DESCRIPTION;

  schema = z.object({
  });

  async execute({ 
  }: z.infer<typeof this.schema>) {
    try {
      if (localhostServer.isRunning()) {
        await localhostServer.stop();
        return {
          content: [
            {
              type: "text" as const,
              text: 'Brainrot mode deactivated! Server stopped.',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: 'Server was not running.',
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }
}
