import { connect } from 'mongoose';
import chalk from 'chalk';
import { container } from '@sapphire/framework';
import users from '@models/users';
import { UserData } from '../../types/UserData';
import { cooldowns } from '@models/cooldowns';
import { CooldownData } from '../../types/CooldownData';
export default class Database {
  // Connect the database
  public connect(uri: string): void {
    connect(uri).then(() =>
      container.client.logger.info(
        `${chalk.cyan('[Database]:')} Connected to the database`
      )
    );
  }

  // Get user's lean data
  public async getUserData(
    userId: string,
    selections: (keyof UserData)[]
  ): Promise<UserData> {
    const data = await users.findOne({ userId }).select(selections).lean();
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
    const data = await users.findOne({ userId: userId }).lean();
    return data?.language! ?? 'en-US';
  }

  // Get user's cooldown data
  public async getUserCooldownData(userId: string): Promise<CooldownData> {
    const data = await cooldowns.findOne({ userId }).lean();
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

  public async addPlayerToClub(userId: string, player: string): Promise<void> {
    await users.updateOne(
      {
        userId,
      },
      {
        $push: {
          club: player,
        },
      },
      {
        upsert: true,
      }
    );
  }

  public async sellPlayer(
    userId: string,
    player: string,
    index: number
  ): Promise<boolean> {
    const userData = await this.getUserData(userId, ['club']);

    if (!userData?.club?.includes(player)) return false;
    const newClub = userData.club.filter(
      (_value: string, i: number) => i !== index
    );

    const playerValue = container.players[player].value;
    if (isNaN(playerValue!)) return false;

    const moneyToAdd = Math.round(playerValue * 0.55);
    await users.updateOne(
      {
        userId,
      },
      {
        $set: {
          club: newClub,
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

  public async multisellPlayers(
    userId: string,
    starting: number,
    ending: number,
    money: number
  ): Promise<void> {
    const userData = await this.getUserData(userId, ['club']);

    const newClub = userData!.club.filter(
      (_value: string, i: number) => i < starting - 1 || i > ending - 1
    );

    const plrs = userData?.club.slice(starting - 1, ending);
    for (const plr of plrs!) {
      if (!newClub.includes(plr) && Object.values(userData?.starters!))
        await this.removeFromStarters(userId, plr);
    }

    await users.updateOne(
      {
        userId,
      },
      {
        $set: {
          club: newClub,
        },
        $inc: {
          money: money,
        },
      }
    );
  }

  public async buyPlayer(userId: string, player: string): Promise<boolean> {
    const value = container.players[player].value;

    await this.addMoney(userId, -value);
    await this.addPlayerToClub(userId, player);

    return true;
  }
}
