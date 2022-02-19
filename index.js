const fs = require('fs'),
    path = require('path');

    module.exports = function FastPriest(mod){
        const { command } = mod;
        const { player } = mod.require.library;

        let skill_ids = {};
        let isEnabled = true;
        let lastTimeout = null;
        let config_file = require('./config.json');

        if (config_file['ARISE_CANCEL_DELAY'] &&
        typeof config_file['ARISE_CANCEL_DELAY'] === "number") {
           skill_ids['6'] = {
               'delay': config_file['ARISE_CANCEL_DELAY']
            };
        }
        if (config_file['SHOCKING_IMPLOSION_CANCEL_DELAY'] &&
        typeof config_file['SHOCKING_IMPLOSION_CANCEL_DELAY'] === "number") {
          skill_ids['16'] = {
              'delay': config_file['SHOCKING_IMPLOSION_CANCEL_DELAY']
            };
        }
        if (config_file['FINAL_REPRISAL_CANCEL_DELAY'] &&
        typeof config_file['FINAL_REPRISAL_CANCEL_DELAY'] === "number") {
         skill_ids['27'] = {
             'delay': config_file['FINAL_REPRISAL_CANCEL_DELAY']
            };
        }
      
        if (config_file['HEALING_CIRCLE_CANCEL_DELAY'] &&
        typeof config_file['HEALING_CIRCLE_CANCEL_DELAY'] === "number") {
        skill_ids['3'] = {
             'delay': config_file['HEALING_CIRCLE_CANCEL_DELAY']
            };
        }
        if (config_file['PURIFYING_CIRCLE_CANCEL_DELAY'] &&
        typeof config_file['PURIFYING_CIRCLE_CANCEL_DELAY'] === "number") {
            skill_ids['10'] = {
                'delay': config_file['PURIFYING_CIRCLE_CANCEL_DELAY']
            };
        }
        if (config_file['KAIAS_CANCEL_DELAY'] &&
        typeof config_file['KAIAS_CANCEL_DELAY'] === "number") {
            skill_ids['22'] = {
           'delay': config_file['KAIAS_CANCEL_DELAY']
            };
        }
        if (config_file['HOLY_BURST_CANCEL_DELAY'] &&
        typeof config_file['HOLY_BURST_CANCEL_DELAY'] === "number") {
            skill_ids['42'] = {
                'delay': config_file['HOLY_BURST_CANCEL_DELAY']
            };
        }
		if (config_file['EDICT_OF_JUDGMENT_CANCEL_DELAY'] &&
        typeof config_file['EDICT_OF_JUDGMENT_CANCEL_DELAY'] === "number") {
            skill_ids['43'] = {
                'delay': config_file['EDICT_OF_JUDGMENT_CANCEL_DELAY']
            };
        }
		if (config_file['BLESSING_CANCEL_DELAY'] &&
        typeof config_file['BLESSING_CANCEL_DELAY'] === "number") {
            skill_ids['5'] = {
                'delay': config_file['BLESSING_CANCEL_DELAY']
            };
        }
 
   
     
        command.add('fastpriest', {
            '$default'() {
                isEnabled = !isEnabled;
                command.message('Priest is now ' + (isEnabled ? 'enabled' : 'disabled') );
            }
        });



        mod.hook('S_ACTION_STAGE', 9, { order: -1000000, filter: {fake: true} }, event => {
            
         if (!isEnabled) return;
            
            const skill_id = Math.floor(event.skill.id / 10000);
            const altSkill_id = event.skill.id % 100;
          //  command.message('skill id'+parseInt(skill_id));
            if (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids) {
                
                const skillInfo = skill_id in skill_ids ? skill_ids[skill_id] : skill_ids[skill_id + '-' + altSkill_id];
    
                lastTimeout = mod.setTimeout(() => {
                    mod.toClient('S_ACTION_END', 5, {
                        gameId: event.gameId,
                        loc: {
                            x: event.loc.x,
                            y: event.loc.y,
                            z: event.loc.z
                        },
                        w: event.w,
                        templateId: event.templateId,
                        skill: event.skill.id,
                        type: 12394123,
                        id: event.id
                    });
    
                }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);
            }
        });
        mod.hook('S_ACTION_END', 5, {'order': -1000000,'filter': {'fake': true }}, event => {
           
           if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'priest') return;
          if (!isEnabled) return;
            const skill_id = Math.floor(event.skill.id / 10000);
            const altSkill_id = event.skill.id % 100;
    
            if (lastTimeout && (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids)) {
                lastTimeout = null;
                if (event.type == 12394123) {
                    event.type = 4;
                    return true;
                } else {
                    return false;
                }
            }
        });
    
        mod.hook('C_CANCEL_SKILL', 3, event => {
            if (!isEnabled || mod.game.me.class !== 'priest') return;
           if (!isEnabled) return;
            if (lastTimeout) {
                mod.clearTimeout(lastTimeout);
                lastTimeout = null;
            }
        });
        mod.hook('S_EACH_SKILL_RESULT', 15, { 'order': -10000000 }, event => {
            if (!isEnabled || !lastTimeout || event.target !== mod.game.me.gameId || !event.reaction.enable) return;
            mod.clearTimeout(lastTimeout);
            lastTimeout = null;
        });
    }