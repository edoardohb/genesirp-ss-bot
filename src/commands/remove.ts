import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('remove')
  .setDescription('Rimuovi il ruolo SS Team ad un utente')
  .addStringOption(option =>
    option.setName('user')
      .setDescription('Nome dello user')
      .setRequired(true))

export async function execute(interaction: CommandInteraction, config: any) {
  const userInput = interaction.options.get('user')?.value as string;
  const gestore = interaction.user;

  const userId = userInput?.replace(/[<@!>]/g, '');

  if (!userId) {
    return interaction.reply({ content: "ID utente non valido!", ephemeral: true });
  }

  const role = interaction.guild?.roles.cache.get('1291366009374117929');
  if (!role) {
    return interaction.reply({ content: "Ruolo non trovato!", ephemeral: true });
  }

  try {
    const member = await interaction.guild?.members.fetch(userId);
    if (!member) {
      return interaction.reply({ content: "Utente non trovato!", ephemeral: true });
    }

    await member.roles.remove(role);

    await interaction.reply({
      content: `${gestore} ha tolto il ruolo <@&1291366009374117929> a <@${member.user.id}>`,
      ephemeral: true
    });
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: "Errore nel rimuovere il ruolo. Riprova più tardi.", ephemeral: true });
  }
}
