import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, User } from 'discord.js';
import fetch from 'node-fetch';
import { Config } from '..';

interface EchoApiResponse {
  pin: number;
  links: {
    bedrock: string;
    fivem: string;
    minecraft: string;
    roblox: string;
    counterstrike: string;
    rust: string;
  };
}

export const command = new SlashCommandBuilder()
  .setName('pin')
  .setDescription('Genera un nuovo PIN Echo per i controlli SS')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Specifica un utente per inviare il PIN.')
      .setRequired(false));

export async function execute(interaction: CommandInteraction, config: Config): Promise<void> {
  const apiKey = config.ECHO_API_KEY;

  try {
    const response = await fetch('https://api.echo.ac/v1/user/pin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Errore nella risposta dell'API: ${response.statusText}`);
    }

    const data = await response.json() as EchoApiResponse;

    const pin = data.pin;
    const fivemLink = data.links.fivem;

    const userOption = interaction.options.get('user')?.user;

    let embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('📌 Nuovo Pin Creato')
      .setDescription(userOption ? `<@${interaction.user.id}> ha richiesto un Pin` : 'Hai richiesto un nuovo Pin.')
      .addFields(
        { name: 'User', value: `<@${interaction.user.id}>`, inline: false },
        { name: 'PIN', value: pin.toString(), inline: false },
        { name: 'Link', value: fivemLink, inline: false }
      )
      .setFooter({ text: 'Nuovo Pin Generato | ss.genesirp.it' });

    if (userOption) {
      embed.addFields({ name: 'Bypasser', value: `<@${userOption.id}>`, inline: false });

      try {
        await userOption.send({ embeds: [embed] });
      } catch (error) {
        console.error('Impossibile inviare il messaggio privato:', error);
      }
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Errore durante la generazione del PIN:', error);
    await interaction.reply({
      content: 'Si è verificato un errore durante la generazione del PIN.',
      ephemeral: true,
    });
  }
}
