import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, GatewayIntentBits, GuildMember } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { command as esitoCommand, execute as esitoExecute } from './commands/esito';
import { command as helpCommand, execute as helpExecute } from './commands/help';
import { command as newPinCommand, execute as newPinExecute } from './commands/nuovo-pin';
import connectDB from './db';

export interface Config {
  TOKEN: string;
  CLIENT_ID: string;
  GUILD_ID: string;
  REQUIRED_ROLE: string;
  NAPSE_URL: string;
  EDO_ID: string;
  NEW_PIN_ID: string;
  MONGODB_URL: string;
}

const config: Config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

const token = config.TOKEN;
const clientId = config.CLIENT_ID;
const guildId = config.GUILD_ID;
const requiredRoleId = config.REQUIRED_ROLE;
const ssChannelId = config.NEW_PIN_ID;

const commands = [
  esitoCommand.toJSON(),
  helpCommand.toJSON(),
  newPinCommand.toJSON()
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

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log(`Il Bot ${client.user?.tag} è online`);
  registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const member = interaction.member as GuildMember;

    if (!member?.roles.cache.has(requiredRoleId)) {
      await interaction.reply({
        content: 'Non hai il ruolo necessario per eseguire questo comando.',
        ephemeral: true
      });
      return;
    }

    switch (interaction.commandName) {
      case 'esito':
        await esitoExecute(interaction, config);
        break;
      case 'help':
        await helpExecute(interaction, config);
        break;
      case 'nuovo-pin':
        if (interaction.channelId !== ssChannelId) {
          await interaction.reply({
            content: `Questo comando può essere eseguito solo nel canale https://discord.com/channels/${guildId}/${ssChannelId}.`,
            ephemeral: true
          });
          return;
        }

        await newPinExecute(interaction, config);
        break;
    }
  }
});

client.login(token);
