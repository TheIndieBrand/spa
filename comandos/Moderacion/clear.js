const { dataRequired } = require("../../functions");
const clear = new Map();

module.exports = {
	nombre: 'clear',
	category: 'Moderación',
    premium: false,
	alias: [],
	description: 'Borra los mensajes de un canal de forma rápida.',
	usage: ['<prefix>clear <messagesAmount>'],
    run: async (client, message, args, _guild) => {
        let LANG = require(`../../LANG/${_guild.configuration.language}.json`);

        if(!message.guild.me.permissions.has('MANAGE_MESSAGES'))return message.reply(LANG.data.permissionsMessagesMe);
        if(!message.member.permissions.has('MANAGE_MESSAGES'))return message.reply(LANG.data.permissionsMessages);

        if(!args[0])return message.reply(await dataRequired(LANG.commands.mod.clear.message1 + '\n\n' + _guild.configuration.prefix + 'clear <messagesAmount>'));
        if(isNaN(parseInt(args[0])))return message.reply(LANG.commands.mod.clear.message2);
        if(parseInt(args[0]) < 0) args[0] = parseInt(args[0]) - parseInt(args[0]) - parseInt(args[0]);

        try{
            if(parseInt(args[0]) > 100) {
                message.reply(LANG.commands.mod.clear.message3.replace('<amopunt>', args[0]));
                if(clear.has(message.guild.id))return message.reply(LANG.commands.mod.clear.message4.replace('<amount>', await clear.get(message.guild.id)));
                clear.set(message.guild.id, parseInt(args[0]));
                function c(amount) {
                    setTimeout(() => {
                        if(amount > 100) {
                            message.channel.bulkDelete(100);
                            let newAmount = amount - 100;
                            c(newAmount);
                            clear.set(message.guild.id, newAmount);                   
                        }else{
                            clear.delete(message.guild.id);
                            message.channel.bulkDelete(amount);
                        }
                    }, 2000);
                }
                c(parseInt(args[0]));
            }else{
                message.channel.bulkDelete(parseInt(args[0]));
                message.reply(LANG.commands.mod.clear.message5.replace('amount', args[0]));
            }
        }catch(err) {}
    },
};
