require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');

// Crear una instancia del cliente de Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// Inicializar la colección de comandos
client.commands = new Collection();

// Ruta a la carpeta de comandos
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Cargar los comandos en la colección
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
    } else {
        console.log(`[WARNING] El comando en ${filePath} no tiene las propiedades necesarias (name, execute).`);
    }
}

// Evento que se ejecuta cuando el bot está listo
client.once('ready', () => {
    console.log('Bot is online!');
});

// Evento que se ejecuta cuando se crea un mensaje
client.on('messageCreate', message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// Iniciar sesión en Discord con el token del bot
client.login(process.env.DISCORD_TOKEN);
