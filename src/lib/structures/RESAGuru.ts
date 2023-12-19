import { container, SapphireClient } from '@sapphire/framework';
import { join } from 'path';
import Database from '@lib/structures/Database';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { UtilsGDrive } from 'utils-google-drive';
import users from '@models/users';
import { JWT } from 'google-auth-library';
// @ts-ignore
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { PlayerData, Players } from 'types/PlayerData';
import chalk from 'chalk';

export class RESAGuru extends SapphireClient {
  private players: Players = {};

  constructor() {
    super({
      intents: ['Guilds'],
      allowedMentions: {
        repliedUser: false,
        parse: [],
      },
      baseUserDirectory: join(__dirname, '..', '..'),
      defaultCooldown: {
        delay: 1000 * 3,
        limit: 1,
      },
      i18n: {
        fetchLanguage: async (context: InternationalizationContext) => {
          const userData = await users
            .findOne({ userId: context.user?.id })
            .lean();

          if (!userData?.language) return 'en-US';
          return userData.language;
        },
      },
    });

    container.db = new Database();
    container.drive = new UtilsGDrive({
      pathCredentials: join(
        process.cwd(),
        'credentials',
        'drive-credentials.json'
      ),
      pathToken: join(process.cwd(), 'credentials', 'drive-token.json'),
    });
    if (container.drive)
      this.logger.info(`${chalk.blue('[Drive API]:')} Connected to the drive!`);

    container.players = this.players;
  }

  public async initialize(): Promise<void> {
    const auth = this.authenticateSheets();
    await this.loadSpreadsheet(auth);
    await this.login();

    const uri = process.env.MONGO_URI;
    if (uri) container.db.connect(uri);
  }

  private async loadSpreadsheet(auth: JWT): Promise<void> {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Base Cards'];
    const rows = await sheet.getRows();
    rows.forEach((row) => {
      this.addPlayer({
        name: row.get('NAME'),
        rank: row.get('RANK'),
        tier: row.get('TIER'),
        club: row.get('CLUB'),
        nation: row.get('NATION'),
        type: row.get('TYPE') === '0' ? null : row.get('TYPE'),
        exclusive: row.get('EXCLUSIVE') === 'Y',
        position: row.get('POSITION'),
        value: 0,
        rating: 0,
      });
    });
  }

  private addPlayer(data: PlayerData): void {
    const key = data.type ? `${data.name}*${data.type}` : data.name;
    this.players[key] = data;
  }

  private authenticateSheets(): JWT {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      keyFile: join(process.cwd(), 'credentials', 'sheet-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    if (auth) {
      container.logger.info(
        `${chalk.green('[Sheets API]:')} Connected to the spreadsheet!`
      );

      return auth;
    }
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    drive: UtilsGDrive;
    db: Database;
    players: Players;
  }
}
