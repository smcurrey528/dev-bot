/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('Hi! I am dev-bot. I tell dev jokes when bugs make you sad');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic goes here!
 */

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "npm run Dev-Bot, yall!")
});

controller.on('user_channel_join', function(bot, message) {
    bot.reply(message, 'git init new groupie')
});

controller.hears(
    ['hello', 'hi', 'greetings', 'hey', 'howdy', 'hola', 'bonjour'],
    ['direct_mention', 'mention', 'direct_message'],
    function(bot,message) {
        bot.reply(message,'Howdy, fellow dev! How goes coding?');
    }
);

controller.hears(
    ['coffee'], ['mention', 'direct_mention', 'direct_message'],
    function(bot, message) {
    bot.reply(message, 'if (coffee.Empty) coffee.Refill(); else coffee.Drink();')
    }
);

controller.hears(
    ['UI'], ['mention', 'direct_mention', 'direct_message'],
    function(bot, message) {
    bot.reply(message, 'A user interface is like a joke. If you have to explain it, then it isn\'t good.')
    }
);

controller.hears(
    ['javascript'],
    ['direct_mention', 'mention', 'direct_message'],
    function(bot,message) {
        bot.reply(message,'Why was the JavaScript developer sad? Because he didn’t Node how to Express himself');
    }
);

controller.hears(
    ['bug'],
    ['direct_mention', 'mention', 'direct_message'],
    function(bot,message) {
        bot.reply(message,'How do you comfort a bug? You console it');
    }
);

controller.hears('error','direct_mention, mention, direct_message', function(bot, message) {
    bot.startConversation(message, function(err, convo) {

    convo.ask({
        attachments:[
                    {
                        title: 'Did you check your console?',
                        callback_id: '123',
                        attachment_type: 'default',
                        actions: [
                            {
                                "name":"yes",
                                "text": "Yes",
                                "value": "yes",
                                "type": "button",
                            },
                            {
                                "name":"no",
                                "text": "No",
                                "value": "no",
                                "type": "button",
                            }
                        ]
                    }
                ]
            },[
                {
                    pattern: "yes",
                    callback: function(reply, convo) {
                        convo.say('FABULOUS!');
                        convo.next();
                    }
                },
                {
                    pattern: "no",
                    callback: function(reply, convo) {
                        convo.say('Too bad');
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(reply, convo) {
                        // do nothing
                    }
                }
         ]);
    });
});





controller.on('direct_message,mention,direct_mention', function (bot, message) {
   bot.api.reactions.add({
       timestamp: message.ts,
       channel: message.channel,
       name: 'robot_face',
   }, function (err) {
       if (err) {
           console.log(err)
       }
       bot.reply(message, 'Don\'t tell me how to React');
   });
});
