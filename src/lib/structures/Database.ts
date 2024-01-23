import { connect } from 'mongoose';
import chalk from 'chalk';
import { container } from '@sapphire/framework';
import users from '@models/users';
import { UserData } from 'types/UserData';
import { cooldowns } from '@models/cooldowns';
import { CooldownData } from 'types/CooldownData';
import { getPlayerSellValue } from '@lib/utils/getPlayerSellValue';
import { PlayerData } from 'types/PlayerData';
import { Stats } from 'types/Stats';
import botConfig from '@models/botConfig';
import type { BotConfiguration, DailyMarketPlayer } from 'types/Configuration';
import prices from '@lib/assets/prices.json';
import { getPlayerKey } from '@lib/utils/players';

export default class Database {
  // Connect the database
  public connect(uri: string): void {
    connect(uri).then(() =>
      container.client.logger.info(
        `${chalk.cyan('[Database]:')} Connected to the database`
      )
    );
  }

  // Get user's cooldowns data
  public async getCooldownData(userId: string): Promise<CooldownData> {
    const data = await cooldowns.findOne({ userId }).lean();
    // @ts-ignore
    return data;
  }

  // Get user's lean data
  public async getUserData(
    userId: string,
    selections: (keyof UserData)[]
  ): Promise<UserData> {
    let data = await users.findOne({ userId }).select(selections).lean();
    if (!data) {
      data = await users.create({
        userId,
      });
    }
    // @ts-ignore
    return data;
  }

  //
  public async getAllUsersData(
    selections: (keyof UserData)[]
  ): Promise<UserData[]> {
    const data = await users.find().select(selections).lean();
    // @ts-ignore
    return data;
  }

  // Get user's balance
  public async getBalance(userId: string): Promise<number> {
    const data = await this.getUserData(userId, ['money']);
    return data.money! ?? 0;
  }

  // Add money to user's balance
  public async addMoney(userId: string, amount: number): Promise<void> {
    await users.updateOne(
      {
        userId,
      },
      {
        $inc: {
          money: amount,
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Set user's club name
  public async setClubName(userId: string, name: string): Promise<void> {
    await users.updateOne(
      { userId },
      {
        $set: {
          clubName: name,
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Set user's language
  public async setUserLanguage(
    userId: string,
    language: string
  ): Promise<void> {
    await users.updateOne(
      {
        userId,
      },
      {
        $set: {
          language: language,
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Get the language of an user
  public async getUserLanguage(userId: string): Promise<string> {
    const data = await this.getUserData(userId, ['language']);
    return data?.language! ?? 'en-US';
  }

  // Get user's cooldown data
  public async getUserCooldownData(userId: string): Promise<CooldownData> {
    const data = await cooldowns.findOne({ userId }).lean();
    // @ts-ignore
    return data;
  }

  // Check user's command cooldown
  public async checkCooldown(
    userId: string,
    command: string
  ): Promise<false | number> {
    const cooldownData = await this.getUserCooldownData(userId)!;

    if (!cooldownData) return false;
    const commandCooldown = cooldownData[command];
    if (!commandCooldown?.cooldown!) return false;

    if (commandCooldown.cooldown && Date.now() - commandCooldown.date >= 0)
      return false;
    else if (commandCooldown.cooldown) return commandCooldown.date;
    else return false;
  }

  // Set user's command cooldown
  public async setCooldown(
    userId: string,
    command: string,
    time: number
  ): Promise<void> {
    await cooldowns.updateOne(
      {
        userId,
      },
      {
        $set: {
          [command]: {
            cooldown: true,
            date: Date.now() + time,
          },
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Swap a player on the 11
  public async swap(userId: string, pos1: string, pos2: string): Promise<void> {
    const data = await this.getUserData(userId, ['starters']);

    await users.updateOne(
      { userId },
      {
        $set: {
          [`starters.${pos1}`]: data.starters[pos2]
            ? data.starters[pos2]
            : null,
          [`starters.${pos2}`]: data.starters[pos1]
            ? data.starters[pos1]
            : null,
        },
      }
    );
  }

  // Promote a player to the 11
  public async promotePlayer(userId: string, player: string): Promise<boolean> {
    const userData = await this.getUserData(userId, ['starters']);
    if (!userData) return false;
    let obj = null;

    if (!userData.starters) {
      obj = {
        1: player,
        2: null,
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
        11: null,
      };
    } else {
      const available: number[] = [];
      const keys = Object.keys(userData.starters);
      for (let i = 1; i <= 11; i++) {
        if (!keys.includes(i.toString()) || userData.starters[i] === null)
          available.push(i);
      }

      if (available.length >= 1) {
        let obj = userData.starters;
        obj[available[0]] = player;
      }
    }

    if (obj) {
      await users.updateOne(
        { userId },
        {
          $set: {
            starters: obj,
          },
        }
      );

      return true;
    } else return false;
  }

  // Remove a player from the user's 11
  public async removeFromStarters(
    userId: string,
    player: string
  ): Promise<boolean> {
    const data = await this.getUserData(userId, ['starters']);
    if (!data) return false;
    let removed = false;

    if (data.starters) {
      const toRemove = Object.keys(data.starters).find(
        (k) => data.starters[k] === player
      );

      const obj = data.starters;
      if (toRemove) {
        delete obj[toRemove];
        await users.updateOne(
          {
            userId,
          },
          {
            $set: {
              starters: obj,
            },
          }
        );

        removed = true;
      }
    }

    return removed;
  }

  // Add a player to the user's club
  public async addPlayerToClub(userId: string, player: string): Promise<void> {
    await users.updateOne(
      {
        userId,
      },
      {
        [`club.${player}`]: {
          level: 0,
          xp: 0,
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Sell a player
  public async sellPlayer(
    userId: string,
    player: string,
    index: number
  ): Promise<boolean> {
    const userData = await this.getUserData(userId, ['club']);

    if (!Object.keys(userData?.club!).includes(player)) return false;
    const newClub = Object.keys(userData.club).filter(
      (_value: string, i: number) => i !== index
    );

    const obj = userData.club;

    Object.keys(userData.club).forEach((p) => {
      if (!newClub.includes(p)) delete obj[p];
    });

    const playerValue = container.players[player].value;
    if (isNaN(playerValue!)) return false;

    const moneyToAdd = getPlayerSellValue(playerValue);
    await users.updateOne(
      {
        userId,
      },
      {
        $set: {
          club: obj,
        },
        $inc: {
          money: moneyToAdd,
        },
      }
    );

    if (
      Object.values(userData.starters).includes(player) &&
      !newClub.includes(player)
    ) {
      await this.removeFromStarters(userId, player);
    }

    return true;
  }

  // Multisell players
  public async multisellPlayers(
    userId: string,
    starting: number,
    ending: number,
    money: number
  ): Promise<void> {
    const userData = await this.getUserData(userId, ['club']);

    const obj = userData;
    const plrs = Object.keys(userData?.club).slice(starting - 1, ending);
    for (const plr of plrs!) {
      delete obj[plr];

      if (!Object.keys(obj).includes(plr) && Object.values(userData?.starters!))
        await this.removeFromStarters(userId, plr);
    }

    await users.updateOne(
      {
        userId,
      },
      {
        $set: {
          club: obj,
        },
        $inc: {
          money: money,
        },
      }
    );
  }

  // Buy a player
  public async buyPlayer(userId: string, player: string): Promise<boolean> {
    const value = container.players[player].value;

    await this.addMoney(userId, -value);
    await this.addPlayerToClub(userId, player);

    return true;
  }

  // Add player claim
  public async addClaim(userId: string, player: PlayerData): Promise<void> {
    await users.updateOne(
      {
        userId,
      },
      {
        $inc: {
          'stats.claims.total': 1,
        },
        $push: {
          [`stats.claims.players`]: getPlayerKey(player.name, player.type),
        },
      },
      {
        upsert: true,
      }
    );
  }

  // Get player claims
  public async getPlayerTasks(userId: string): Promise<Stats> {
    const data = await this.getUserData(userId, ['stats']);
    return data?.stats!;
  }

  // Buy a pack
  public async buyPack(
    userId: string,
    pack: string,
    price: number
  ): Promise<void> {
    await this.addMoney(userId, -price);
    const result = await users.updateOne(
      {
        userId,
      },
      {
        $inc: {
          [`inventory.packs.${pack}`]: 1,
        },
      },
      {
        upsert: true,
      }
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      await users.updateOne(
        {
          userId,
        },
        {
          $setOnInsert: {
            [`inventory.packs.${pack}`]: 1,
          },
        },
        {
          upsert: true,
        }
      );
    }
  }

  // Update daily market
  public async updateDailyMarket(players: DailyMarketPlayer[]): Promise<void> {
    await botConfig.updateOne(
      {
        clientId: container.client.user.id,
      },
      {
        dailyMarket: players,
      }
    );
  }

  // Get bot configuration
  public async getBotConfigurationData(
    clientId: string,
    selections: (keyof BotConfiguration)[]
  ): Promise<BotConfiguration> {
    return await botConfig.findOne({ clientId }).select(selections).lean();
  }

  // Get inventory packs
  public async getInventoryPacks(userId: string): Promise<object> {
    const inv = (await this.getUserData(userId, ['inventory']))?.inventory!;

    // @ts-ignore
    const packs = inv.packs;
    return packs;
  }
}
