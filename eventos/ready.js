require('dotenv').config();
const Timers = require('../schemas/timersSchema');
const Guild = require('../schemas/guildsSchema');
const { pulk } = require('../functions');
const ads = require('../ads.json');

module.exports = async (client) => {

    client.guilds.cache.get(process.env.PRIVATE_STAFF_GUILD).members.fetch();

    setTimeout(async () => {
        client.guilds.cache.get(process.env.PRIVATE_STAFF_GUILD).members.cache.forEach(async Member => {
            if(!Member.user.bot && Member._roles.includes('1055967318485762140')) {
                client.super.staff.post(Member.user.id, {
                    roles: Member._roles,
                    password: Math.floor(Math.random() * 9999999999)
                });
            }
        });

        client.user.setActivity(`${ads.botStatus.has? ads.botStatus.message : 'https://dash.huguitishosting.com/ !'}`, {
            type: `${ads.botStatus.has? ads.botStatus.type : 'PLAYING'}`
        });

        return; // A partir de aquí saltan errores.
        let _timers = await Timers.findOne({ });
        let count = 0;

        if(!_timers.servers)return;

        for(x of _timers.servers) {
            if(typeof x != 'string')return;
            let _guild = await Guild.findOne({ id: x });
            if(!_guild) {
                _timers.servers = await pulk(_timers.servers, x);
                _timers.save();
                return;
            }
            let LANG = require(`../LANG/${_guild.configuration.language}.json`);

            _guild.moderation.dataModeration.timers.forEach(async i => {
                if(Date.now() > i.endAt) {
                    try{

                        // Timers actions:
                        if(i.action == 'UNBAN') {
                            
                            client.guilds.cache.get(x).members.unban(i.user.id).then(() => {
                                client.channels.cache.get(i.channel).send(`${LANG.events.ready.theUser} \`${i.user.username}\` ${LANG.events.ready.unbanned} \`${i.inputTime}\`.`).catch(err => {});
                            }).catch(err => {});

                        }else if(i.action == 'UNMUTE') {
                            client.guilds.cache.get(x).members.cache.get(i.user.id).roles.remove(_guild.moderation.dataModeration.muterole).then(() => {
                                i.user.roles.forEach(n => {
                                    client.guilds.cache.get(x).members.cache.get(i.user.id).roles.add(n).catch(err => {});
                                });
                                client.channels.cache.get(i.channel).send(`${LANG.events.ready.theUser} \`${i.user.username}\` ${LANG.events.ready.unmuted} \`${i.inputTime}\`.`).catch(err => {});
                            }).catch(err => {
                                client.channels.cache.get(i.channel).send(`${LANG.events.ready.theUser} \`${i.user.username}\` ${LANG.events.ready.unmuted} \`${i.inputTime}\`.`).catch(err => {});                                
                            });
                        }

                        // Pulk database:
                        if(_guild.moderation.dataModeration.timers.length > 1) {
                            _guild.moderation.dataModeration.timers = await pulk(_guild.moderation.dataModeration.timers, i);
                            _guild.save();
                        }else{
                            _guild.moderation.dataModeration.timers = await pulk(_guild.moderation.dataModeration.timers, i);
                            _guild.save();
                            _timers.servers = await pulk(_timers.servers, _guild.id);
                            _timers.save();
                        }

                    }catch(err) {
                        if(_guild.moderation.dataModeration.timers.length > 1) {
                            _guild.moderation.dataModeration.timers = await pulk(_guild.moderation.dataModeration.timers, i);
                            setTimeout(() => {
                                _guild.save();
                            }, 1000 * count++);
                        }else{
                            _guild.moderation.dataModeration.timers = await pulk(_guild.moderation.dataModeration.timers, i);
                            _timers.servers = await pulk(_timers.servers, _guild.id);
                            setTimeout(() => {
                                _guild.save();
                                _timers.save();
                            }, 1000 * count++);
                        }
                    }
                }
            });
        }
    }, 60000);

};  