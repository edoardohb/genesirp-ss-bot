import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ActivityType, Client, Events, GatewayIntentBits, GuildMember, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { command as esitoCommand, execute as esitoExecute } from './commands/esito';
import { command as helpCommand, execute as helpExecute } from './commands/help';
import { command as newPinCommand, execute as newPinExecute } from './commands/pin';
import { command as addCommand, execute as addExecute } from './commands/add';
import { command as removeCommand, execute as removeExecute } from './commands/remove';
import { command as temproleCommand, execute as temproleExecute } from './commands/temprole';
import connectDB from './db';
import { removeExpiredRoles } from './commands/temprole';

export interface Config {
  TOKEN: string;
  CLIENT_ID: string;
  GUILD_ID: string;
  REQUIRED_ROLE: string;
  NAPSE_URL: string;
  EDO_ID: string;
  NEW_PIN_ID: string;
  MONGODB_URL: string;
  ECHO_API_KEY: string;
}

const config: Config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

const token = config.TOKEN;
const clientId = config.CLIENT_ID;
const guildId = config.GUILD_ID;
const ssChannelId = config.NEW_PIN_ID;

const commands = [
  esitoCommand.toJSON(),
  helpCommand.toJSON(),
  newPinCommand.toJSON(),
  addCommand.toJSON(),
  removeCommand.toJSON(),
  temproleCommand.toJSON(),
];

const rest = new REST({ version: '9' }).setToken(token);

connectDB();

async function registerCommands(): Promise<void> {
  try {
    console.log('Aggiornando (/) comandi...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Comandi registrati con successo!');
  } catch (error) {
    console.error('Errore nel registrare i comandi:', error);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});

const activities = [
  { name: `genesirp.it`, type: ActivityType.Playing },
  { name: `fivem://connect/`, type: ActivityType.Listening },
  { name: `discord.gg/genesirp`, type: ActivityType.Watching },
];

let currentActivityIndex = 0;

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Il Bot ${readyClient.user.tag} è online`);
  registerCommands();

  const updateTotalUsersActivity = async () => {
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    activities.push({
      name: `${totalUsers} Membri`,
      type: ActivityType.Streaming,
    });
  };

  await updateTotalUsersActivity();

  setInterval(async () => {
    currentActivityIndex = (currentActivityIndex + 1) % activities.length;

    if (currentActivityIndex === activities.length - 1) {
      await updateTotalUsersActivity();
    }

    client?.user?.setPresence({
      activities: [activities[currentActivityIndex]],
      status: "online",
    });
  }, 10000);

  console.log('[DEBUG] Eseguendo il primo controllo dei ruoli...');
  await removeExpiredRoles(client);

  setInterval(async () => {
    await removeExpiredRoles(client);
  }, 10000);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const member = interaction.member as GuildMember;

    if (!member?.roles.cache.has("1291200023937421312")) {
      await interaction.reply({
        content: 'Non hai il ruolo necessario per eseguire questo comando.',
        ephemeral: true
      });
      return;
    }

    switch (interaction.commandName) {
      case 'esito':
        await esitoExecute(interaction);
        break;

      case 'help':
        await helpExecute(interaction, config);
        break;

      case 'pin':
        if (interaction.channelId !== ssChannelId) {
          await interaction.reply({
            content: `Questo comando può essere eseguito solo nel canale https://discord.com/channels/${guildId}/${ssChannelId}.`,
            ephemeral: true
          });
          return;
        }

        await newPinExecute(interaction, config);
        break;

      case 'add':
        if (interaction.channelId !== "1291437015308439668") {
          await interaction.reply({
            content: `Questo comando può essere eseguito solo nel canale https://discord.com/channels/${guildId}/1291437015308439668.`,
            ephemeral: true
          });
          return;
        }

        await addExecute(interaction);
        break;

      case 'remove':
        if (interaction.channelId !== "1291437015308439668") {
          await interaction.reply({
            content: `Questo comando può essere eseguito solo nel canale https://discord.com/channels/${guildId}/1291437015308439668.`,
            ephemeral: true
          });
          return;
        }

        await removeExecute(interaction);
        break;

      case 'temprole':
        if (member?.roles.cache.has("1291200023937421312")) {
          await temproleExecute(interaction)
          return;
        }

        break;
    }
  }
});

client.login(token);
