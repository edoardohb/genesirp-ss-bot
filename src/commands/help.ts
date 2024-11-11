import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Guida su come utilizzare il comando /esito');

export async function execute(interaction: CommandInteraction, config: any) {
  const isEdo = interaction.user.id === config.EDO_ID;

  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('💡 Guida su come usare il comando `/esito`')
    .setDescription('Questo comando consente di inviare un esito della screenshare con tutte le informazioni necessarie.')
    .addFields(
      { name: '**Parametri del comando**', value: 'Il comando richiede 5 parametri:', inline: false },
      { name: '__Bypasser__', value: 'Nome del bypasser (tag)', inline: true },
      { name: '__PIN__', value: 'PIN SS', inline: true },
      { name: '__Time__', value: 'Tempo', inline: true },
      { name: '__Found__', value: 'Il cheat è stato trovato?', inline: true },
      { name: '__Proofs__', value: 'Prove (link | no)', inline: true },
      { name: '**Esempio di utilizzo**', value: '`/esito bypasser: <@1044344751547240468> pin: 280215 time: 42min found: No proofs: No`', inline: false }
    )
    .setFooter({ text: 'Comando help | ss.genesirp.it' });

  await interaction.reply({ embeds: [embed], ephemeral: isEdo ? false : true });
}
