import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import Esito from '../models/Esito';

export const command = new SlashCommandBuilder()
  .setName('esito')
  .setDescription('Comando per inviare esito screenshot')
  .addStringOption(option =>
    option.setName('bypasser')
      .setDescription('Nome del bypasser')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('pin')
      .setDescription('PIN (numero o stringa)')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('time')
      .setDescription('Tempo (stringa)')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('found')
      .setDescription('Se il problema è stato trovato (yes/no)')
      .setRequired(true)
      .addChoices(
        { name: 'Yes', value: 'yes' },
        { name: 'No', value: 'no' }
      ))
  .addStringOption(option =>
    option.setName('proofs')
      .setDescription('Prove (stringa o "no")')
      .setRequired(true));

export async function execute(interaction: CommandInteraction, config: any) {
  const bypasser = interaction.options.get('bypasser')?.value as string;
  const pin = interaction.options.get('pin')?.value as string;
  const time = interaction.options.get('time')?.value as string;
  const found = interaction.options.get('found')?.value as string;
  const proofs = interaction.options.get('proofs')?.value as string;

  const screenSharer = interaction.user;

  const link = /^[A-Z0-9]{8}$/.test(pin) ? `https://anticheat.ac/pins/result/${pin}` : `https://www.napse.ac/results/${pin}`;

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('📸 Esito Screenshare')
    .setDescription('Ecco il risultato della screenshare in dettaglio:')
    .setThumbnail('https://media.discordapp.net/attachments/1303379076706336931/1304584759573221408/Logo_nero_grigio.png')
    .addFields(
      { name: '__**Bypasser**__:', value: bypasser, inline: true },
      { name: '__**ScreenSharer**__:', value: `<@${screenSharer.id}>`, inline: true },
      { name: '__**Pin**__:', value: `[${pin}](${link})`, inline: true },
      { name: '__**Time**__:', value: time, inline: true },
      { name: '__**Found**__:', value: found === 'yes' ? '✅ Trovato' : '❌ Non trovato', inline: true },
      { name: '__**Proofs**__:', value: proofs.toLowerCase() === 'no' ? '❌ Nessuna prova fornita' : proofs, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'Comando esito | ss.genesirp.it' });

  try {
    const esito = new Esito({
      bypasser,
      pin,
      time,
      found,
      proofs,
      scanner: link,
      screenSharer: screenSharer.id
    });

    await esito.save();
    console.log('Esito salvato nel database');
  } catch (error) {
    console.error('Errore nel salvare l\'esito nel database:', error);
  }

  await interaction.reply({ embeds: [embed] });
}
