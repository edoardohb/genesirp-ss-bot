import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import fetch from 'node-fetch';

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
  .setName('nuovo-pin')
  .setDescription('Genera un nuovo Pin per i controlli SS');

export async function execute(interaction: CommandInteraction, config: any): Promise<void> {
  const isEdo = interaction.user.id === config.EDO_ID;

  try {
    const response = await fetch('https://api.echo.ac/v1/user/pin', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer 2777KLEuNPUybN8WgnpCqe.YCmAHbEsjVAkmxoAhoCXk62dR5TxZbtLpBi9PbrkuSPM',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore nella risposta dell'API: ${response.statusText}`);
    }

    const data = await response.json() as EchoApiResponse;

    const pin = data.pin;
    const fivemLink = data.links.fivem;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('📌 Nuovo Pin Creato')
      .setDescription('Hai richiesto un nuovo Pin per i controlli SS.')
      .addFields(
        { name: 'User', value: `<@${interaction.user.id}>`, inline: false},
        { name: 'PIN', value: pin.toString(), inline: false },
        { name: 'Link FiveM', value: fivemLink, inline: false }
      )
      .setFooter({ text: 'Nuovo Pin Generato | ss.genesirp.it' });

    await interaction.reply({ embeds: [embed], ephemeral: isEdo ? false : true });

  } catch (error) {
    console.error('Errore durante la generazione del PIN:', error);
    await interaction.reply({
      content: 'Si è verificato un errore durante la generazione del PIN.',
      ephemeral: true,
    });
  }
}
