import { container, SapphireClient } from '@sapphire/framework';
import { join } from 'path';
import Database from '@lib/structures/Database';
import type { InternationalizationContext } from '@sapphire/plugin-i18next';
import { UtilsGDrive } from 'utils-google-drive';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { PlayerData, Players } from 'types/PlayerData';
import chalk from 'chalk';
import sheetCredentials from '../../../credentials/sheetCredentials.json';

export class RESAGuru extends SapphireClient {
  private players: Players = {};

  constructor() {
    super({
      intents: ['Guilds', 'GuildMessages'],
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
          const userData = await container.db.getUserData(context.user!.id, [
            'language',
          ]);

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
        'driveCredentials.json'
      ),
      pathToken: join(process.cwd(), 'credentials', 'driveToken.json'),
    });
    if (container.drive)
      this.logger.info(`${chalk.blue('[Drive API]:')} Connected to the drive!`);

    container.players = this.players;
  }

  public async initialize(): Promise<void> {
    const auth = await this.authenticateSheets();
    await this.loadSpreadsheet(auth);
    await this.login();

    const uri = process.env.MONGO_URI;
    if (uri) container.db.connect(uri);
  }

  private async loadSpreadsheet(doc: GoogleSpreadsheet): Promise<void> {
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['(RANK->NUMBER) Base Cards'];
    const rows = await sheet.getRows();
    rows.forEach((row) => {
      this.addPlayer({
        name: row.NAME,
        rating: Number(row.RATING),
        tier: row.TIER,
        club: row.CLUB,
        nation: row.NATION,
        type: row.TYPE === '0' ? null : row.TYPE,
        exclusive: row.EXCLUSIVE === 'Y',
        position: row.POSITION,
        value: Number(row.PRICE!) ?? 0,
        playstyle: row.PLAYSTYLE?.length! > 0 ? row.PLAYSTYLE! : null,
      });
    });
  }

  private addPlayer(data: PlayerData): void {
    const key = data.type ? `${data.name}*${data.type}` : data.name;
    this.players[key] = data;
  }

  private async authenticateSheets(): Promise<GoogleSpreadsheet> {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: sheetCredentials.client_email,
      private_key: sheetCredentials.private_key,
    });

    return doc;
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    drive: UtilsGDrive;
    db: Database;
    players: Players;
  }
}
