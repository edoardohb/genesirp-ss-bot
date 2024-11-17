import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, Role, Client } from 'discord.js';
import ms from 'ms';
import Temprole from '../models/Temprole';

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

    const temprole = new Temprole({
      user: member.user.id,
      role: roleInput.id,
      staff: gestore.id,
      createdAt: new Date(),
      duration: duration
    });

    await temprole.save();

  } catch (error) {
    console.error(error);
    return interaction.reply({ content: "Errore nell'assegnare il ruolo. Riprova più tardi.", ephemeral: true });
  }
}

// Function to remove expired roles on bot startup
export async function removeExpiredRoles(client: Client) {
  try {
    const now = new Date();
    const expiredRoles = await Temprole.find({});
    
    console.log(`[DEBUG] Controllando ${expiredRoles.length} ruoli temporanei`);

    for (const record of expiredRoles) {
      const expirationTime = new Date(record.createdAt.getTime() + record.duration);
      
      console.log(`[DEBUG] Ruolo: ${record.role}`);
      console.log(`[DEBUG] Data creazione: ${record.createdAt}`);
      console.log(`[DEBUG] Durata: ${record.duration}`);
      console.log(`[DEBUG] Data scadenza: ${expirationTime}`);
      console.log(`[DEBUG] Data attuale: ${now}`);
      console.log(`[DEBUG] È scaduto?: ${now >= expirationTime}`);

      if (now >= expirationTime) {
        console.log(`[DEBUG] Processando ruolo scaduto per utente ${record.user}`);
        
        // Cerca in tutte le guild del bot
        for (const guild of client.guilds.cache.values()) {
          try {
            console.log(`[DEBUG] Cercando in guild: ${guild.name}`);
            
            const member = await guild.members.fetch(record.user);
            const role = guild.roles.cache.get(record.role);

            console.log(`[DEBUG] Membro trovato: ${!!member}`);
            console.log(`[DEBUG] Ruolo trovato: ${!!role}`);

            if (member && role) {
              console.log(`[DEBUG] Rimuovendo ruolo ${role.name} da ${member.user.tag}`);
              await member.roles.remove(role);
              console.log(`[DEBUG] Ruolo rimosso con successo`);
              
              await Temprole.deleteOne({ _id: record._id });
              console.log(`[DEBUG] Record eliminato dal database`);
              break;
            }
          } catch (error) {
            console.error(`[DEBUG] Errore specifico: ${error}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('[DEBUG] Errore principale:', error);
  }
}
