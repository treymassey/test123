
const config = {
  MicrosoftAppId: process.env.BOT_ID,
  TeamsAppId: process.env.TEAMS_APP_ID,
  AzureSubscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
  AzureResourceGroupName: process.env.AZURE_RESOURCE_GROUP_NAME,
  ResourceSuffix: process.env.RESOURCE_SUFFIX,
  BotAzureAppServiceResourceId: process.env.BOT_AZURE_APP_SERVICE_RESOURCE_ID,
  BotDomain: process.env.BOT_DOMAIN,
  OpenAIApiKey: process.env.OPENAI_API_KEY,
  // Add other variables as needed
};

module.exports = config;
