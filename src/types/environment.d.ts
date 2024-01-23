export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly DISCORD_TOKEN: string;
      readonly GUILD_ID: string;
      readonly MONGO_URI: string;
      readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
      readonly SPREADSHEET_ID: string;
      readonly REFRESH_TOKEN: string;
    }
  }
}
