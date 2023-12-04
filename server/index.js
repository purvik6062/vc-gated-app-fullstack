const express = require("express");
const { auth, resolver, loaders } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const { Server } = require("socket.io");
const cors = require("cors");
const { humanReadableAuthReason, proofRequest } = require("./proofRequest");
const path = require("path");
const { Routes } = require('discord-api-types/v9');
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { Client, REST, IntentsBitField, GatewayIntentBits, Events, Partials, } = require("discord.js");
require("dotenv").config();

const app = express();
const port = 8008;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
);

// Assuming you have a route handling OAuth2 authentication
passport.use(new DiscordStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ["identify"],
  },
  (accessToken, refreshToken, profile, done) => {
    // Additional logic, if needed, to store user information in your database
    return done(null, profile);
  }
)
);

// Express session and Passport middleware setup
app.use(require("express-session")({
  secret: "your-secret-key",
  resave: true,
  saveUninitialized: true,
})
);

app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize user functions
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/", (req, res) => {
  res.send(
    `Welcome to your backend Polygon ID verifier server! There are ${Object.keys(apiPath).length
    } routes available: ${Object.values(apiPath).join(" and ")}.`
  );
});

const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});


const myClient = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.GuildMessageReactions,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

myClient.login(process.env.TOKEN);


const commands = [
  {
    name: 'verify',
    description: 'Initiate the verification process.',
  },
];

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

const getARoleChannel = myClient.channels.cache.get(process.env.GET_A_ROLE_CHANNEL_ID);

myClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;


  if (commandName === 'verify' && interaction.channelId === process.env.GET_A_ROLE_CHANNEL_ID) {
    await interaction.deferReply({ ephemeral: true });

    // Initial reply with the "Verify" button
    interaction.editReply({
      content: 'Please click the "Verify" button to initiate the verification process.',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: 'Verify',
              customId: 'verify-button',
            },
          ],
        },
      ],
    });
  } else {
    // Reply if the command is used in the wrong channel
    const getARoleChannel = myClient.channels.cache.get(process.env.GET_A_ROLE_CHANNEL_ID);
    if (getARoleChannel) {
      interaction.reply(`This command can only be used in the ${getARoleChannel.toString()} channel.`);
    } else {
      interaction.reply('This command can only be used in the #get-a-role channel.');
    }
  }
});

myClient.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  console.log("interaction:", interaction);
  console.log("interaction:", interaction.user.id);
  const { customId } = interaction;

  if (customId === 'verify-button') {
    // Edit the initial reply to include the verification link
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({
      content: 'Please click the link below to verify your credential:',
      embeds: [{
        title: 'Verification Page',
        description: 'To gain the VC-Holder role, you must first verify your verifiable credential. This process ensures that you are indeed a VC-Holder. Once you are successfully verify your credential then click on the "Give Me The Role" button to get the role. Click the link below to start the verification:',
        color: 0x3498db,
        // fields: [
        //   {
        //     name: 'Verification Link',
        //     value: `[__Click here__](${process.env.VERIFICATION_URL})`,
        //     inline: true,
        //     customId: 'verify-link',
        //   },
        // ],
        thumbnail: {
          url: 'https://en.wikialpha.org/mediawiki/images/f/f9/Blue_Verified.png',
        },
        footer: {
          text: 'Verification System',
          icon_url: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', // URL to the bot's icon
        },
      }],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: 'Verify Credential',
              url: process.env.VERIFICATION_URL,
            },
          ],
        },
      ],
    });
  }
});


app.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      console.log("req", req);
      console.log("req.query.sessionId", req.query.sessionId);
      console.log("User Object:", req.user);

      const discordUsername = req.user && req.user.username;
      console.log("Discord Username:", discordUsername);
      // Check if the user is part of the guild
      const guildId = process.env.GUILD_ID;
      const guild = await myClient.guilds.fetch(guildId);
      const member = await guild.members.fetch(req.user.id);
      // Get the role IDs
      const vcRoleId = process.env.VC_HOLDER_ROLE_ID;
      const newRole = guild.roles.cache.get(vcRoleId);
      // Assign the new role to the user
      await member.roles.add(newRole);

      const channelId = process.env.GET_A_ROLE_CHANNEL_ID;
      const channel = await guild.channels.fetch(channelId);

      // Send a success message to the channel
      await channel.send(`${discordUsername} has successfully verified and claimed the vc-holder role.`);
      // Respond with a success message
      res.status(200).send(`Role assigned: ${newRole.name}`);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).send("Error assigning role.");
    }
  }
);

app.get('/redirect', (req, res) => {
  res.redirect('https://discord.com/api/oauth2/authorize?client_id=1178556490999664681&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8008%2Fauth%2Fdiscord%2Fcallback&scope=identify+guilds');
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// save auth qr requests
const authRequests = new Map();

const apiPath = {
  getAuthQr: "/api/get-auth-qr",
  handleVerification: "/api/verification-callback",
};

app.get(apiPath.getAuthQr, (req, res) => {
  getAuthQr(req, res);
});

app.post(apiPath.handleVerification, (req, res) => {
  handleVerification(req, res);
});

const STATUS = {
  IN_PROGRESS: "IN_PROGRESS",
  ERROR: "ERROR",
  DONE: "DONE",
};

const socketMessage = (fn, status, data) => ({
  fn,
  status,
  data,
});

// GetQR returns auth request
async function getAuthQr(req, res) {
  console.log("authRequests in getAuthQr", authRequests);
  const sessionId = req.query.sessionId;
  console.log("sessionId in getAuthQr", sessionId);
  console.log(`getAuthQr for ${sessionId}`);

  io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId));

  const uri = `${process.env.HOSTED_SERVER_URL}${apiPath.handleVerification}?sessionId=${sessionId}`;

  // Generate request for basic authentication
  // https://0xpolygonid.github.io/tutorials/verifier/verification-library/request-api-guide/#createauthorizationrequest
  const request = auth.createAuthorizationRequest(
    humanReadableAuthReason,
    process.env.VERIFIER_DID,
    uri
  );

  request.id = sessionId;
  request.thid = sessionId;

  const scope = request.body.scope ?? [];
  request.body.scope = [...scope, proofRequest];

  // store this session's auth request
  authRequests.set(sessionId, request);

  io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, request));

  return res.status(200).set("Content-Type", "application/json").send(request);
}

async function handleVerification(req, res) {
  console.log("authRequests in handleVerification", authRequests);
  const sessionId = req.query.sessionId;
  console.log("sessionId in handleVerification", sessionId);
  // get this session's auth request for verification
  const authRequest = authRequests.get(`${sessionId}`);

  console.log(`handleVerification for ${sessionId}`);

  io.sockets.emit(sessionId, socketMessage("handleVerification", STATUS.IN_PROGRESS, authRequest));

  // get JWZ token params from the post request
  const raw = await getRawBody(req);
  const tokenStr = raw.toString().trim();

  const mumbaiContractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4";
  const keyDIR = "./keys";

  const ethStateResolver = new resolver.EthStateResolver(
    process.env.RPC_URL_MUMBAI,
    mumbaiContractAddress
  );

  const resolvers = {
    ["polygon:mumbai"]: ethStateResolver,
  };

  // // console.log(path.join(__dirname, keyDIR))

  // Locate the directory that contains circuit's verification keys
  const verifier = await auth.Verifier.newVerifier(
    {
      stateResolver: resolvers,
      circuitsDir: path.join(__dirname, keyDIR),
      ipfsGatewayURL: "https://ipfs.io"
    }
  );

  // console.log(verifier)

  try {
    const opts = {
      AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
    };
    authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
    const userId = authResponse.from;
    io.sockets.emit(
      sessionId,
      socketMessage("handleVerification", STATUS.DONE, authResponse)
    );
    console.log("authResponse.thid:", authResponse.thid);
    console.log("authResponse:", authResponse);
    console.log("userId:", userId);
    return res
      .status(200)
      .set("Content-Type", "application/json")
      .send("User " + userId + " succesfully authenticated");
  } catch (error) {
    console.log("handleVerification error", sessionId, error);
    io.sockets.emit(
      sessionId,
      socketMessage("handleVerification", STATUS.ERROR, error)
    );
    return res.status(500).send(error);
  }
}
