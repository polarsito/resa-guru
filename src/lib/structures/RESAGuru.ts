import { container, SapphireClient } from '@sapphire/framework';
import path, { join } from 'path';
import Database from '@lib/structures/Database';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { UtilsGDrive } from 'utils-google-drive';
import users from '@models/users';
import { JWT } from 'google-auth-library';
// @ts-ignore
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { PlayerData, Players } from '../../types/PlayerData';

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
      pathCredentials: path.join(
        process.cwd(),
        'credentials',
        'credentials.json'
      ),
      pathToken: path.join(process.cwd(), 'credentials', 'token.json'),
    });
    container.players = this.players;
  }

  public async initialize(): Promise<void> {
    await this.loadSpreadsheet();
    await this.login();

    const uri = process.env.MONGO_URI;
    if (uri) container.db.connect(uri);
    console.log(this.players);
  }

  private async loadSpreadsheet(): Promise<void> {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      keyFile: join(process.cwd(), 'credentials', 'sp-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

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
}

declare module '@sapphire/pieces' {
  interface Container {
    drive: UtilsGDrive;
    db: Database;
    players: Players;
  }
}
