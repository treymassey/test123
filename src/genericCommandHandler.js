
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

class GenericCommandHandler {
  triggerPatterns = new RegExp(/^.+$/);

  async getGraphClient(context) {
    // Get access token from context (Teams SSO or Bot Framework)
    const token = context.adapter && context.adapter.getUserToken
      ? await context.adapter.getUserToken(context, undefined, undefined)
      : null;
    if (!token) throw new Error("Unable to acquire access token for Microsoft Graph.");
    return Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  }

  async handleCommandReceived(context, state) {
    console.log(`App received message: ${context.activity.text}`);
    let response = "";
    const text = context.activity.text.trim();
    // Adaptive card commands
    const cardMap = {
      "ask llm": "askLLM.json",
      "ask a question": "askLLM.json",
      "summarize meeting": "summarizeDiscussion.json",
      "record attendance": "recordAttendance.json",
      "send reminder": "sendReminder.json",
      "share file": "shareFileLink.json",
      "collect feedback": "collectFeedback.json",
      "take notes": "takeNotes.json",
      "transcribe audio": "transcribeAudio.json",
      "assign tasks": "assignTasks.json",
      "monitor qa": "monitorQA.json",
      "automate followup": "automateFollowup.json"
    };
    if (cardMap[text]) {
      const card = require(`./adaptiveCards/${cardMap[text]}`);
      await context.sendActivity({
        attachments: [{
          contentType: "application/vnd.microsoft.card.adaptive",
          content: card
        }]
      });
      response = `Sent adaptive card for '${text}'.`;
    } else if (context.activity.value && context.activity.value.question) {
      // Handle LLM question submission
      const question = context.activity.value.question;
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        response = "OpenAI API key not configured.";
      } else {
        try {
          const fetch = require("node-fetch");
          const apiUrl = "https://api.openai.com/v1/chat/completions";
          const payload = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: question }],
            max_tokens: 256
          };
          const apiRes = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify(payload)
          });
          const data = await apiRes.json();
          const answer = data.choices && data.choices[0] && data.choices[0].message.content
            ? data.choices[0].message.content
            : "No answer returned.";
          response = answer;
        } catch (err) {
          response = `Failed to query OpenAI: ${err.message}`;
        }
      }
    } else if (context.activity.value) {
      // Handle other adaptive card submissions
      // Just echo the submitted values for now
      response = `Received card submission: ${JSON.stringify(context.activity.value)}`;
    } else {
      switch (text) {
        case "hi":
          response = "Hi there! I'm your Command Bot, here to assist you with your tasks. Type 'help' for a list of available commands.";
          break;
        case "hello":
          response = "Hello! I'm your Command Bot, always ready to help you out. If you need assistance, just type 'help' to see the available commands.";
          break;
        case "help":
          response = "Here's a list of commands I can help you with:\n" +
            Object.keys(cardMap).map(cmd => `- '${cmd}': Show ${cardMap[cmd].replace('.json','').replace(/([A-Z])/g, ' $1').toLowerCase()} card.`).join("\n") +
            "\nFeel free to ask for help anytime you need it!";
          break;
        default:
          response = `Sorry, command unknown. Please type 'help' to see the list of available commands.`;
      }
    }
    return response;
  }
}

module.exports = {
  GenericCommandHandler,
};
