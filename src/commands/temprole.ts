import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, GuildMember, Role } from 'discord.js';
import ms from 'ms';

export const command = new SlashCommandBuilder()
  .setName('temprole')
  .setDescription('Assegna un ruolo temporaneo a un utente')
  .addStringOption(option =>
    option.setName('user')
      .setDescription('Nome dello user')
      .setRequired(true))
  .addRoleOption(option =>
    option.setName('role')
      .setDescription('Il ruolo da assegnare')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('time')
      .setDescription('Durata per la quale assegnare il ruolo (es. 5d, 2h)')
      .setRequired(true));

export async function execute(interaction: CommandInteraction) {
  const userInput = interaction.options.get('user')?.value as string;
  const roleInput = interaction.options.get('role')?.role as Role;
  const timeInput = interaction.options.get('time')?.value as string;

  const gestore = interaction.user;

  const userId = userInput.replace(/[<@!>]/g, '');

  const duration = ms(timeInput);

  if (!duration) {
    return interaction.reply({ content: "Durata non valida!", ephemeral: true });
  }

  try {
    const member = await interaction.guild?.members.fetch(userId);
    if (!member) {
      return interaction.reply({ content: "Utente non trovato!", ephemeral: true });
    }

    await member.roles.add(roleInput);

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('TempRole')
      .setDescription(`${gestore} ha dato il ruolo <@&${roleInput.id}> a <@${member.user.id}> per ${ms(duration, { long: true })}.`)
      .setFooter({ text: 'Comando temprole | genesirp.it' });

    await interaction.reply({ embeds: [embed], ephemeral: false });

    setTimeout(async () => {
      try {
        await member.roles.remove(roleInput);
        console.log(`Ruolo <@&${roleInput.id}> rimosso da <@${member.user.id}> dopo ${ms(duration, { long: true })}`);
      } catch (error) {
        console.error("Errore nella rimozione del ruolo:", error);
      }
    }, duration);

  } catch (error) {
    console.error(error);
    return interaction.reply({ content: "Errore nell'assegnare il ruolo. Riprova più tardi.", ephemeral: true });
  }
}
