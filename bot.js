const abi = require("./abi.json");
const { token } = require('./config.json');

const ethers = require('ethers');
const { Client, Intents, MessageEmbed, MessageAttachment } = require('discord.js');

require('dotenv').config();

const network = {
  name: "polygon",
  chainId: 137,
  _defaultProvider: (providers) => new providers.JsonRpcProvider(process.env.ALCHEMY_URL)
};

const provider = ethers.getDefaultProvider(network);
const aavegotchiDiamond = new ethers.Contract('0x86935F11C86623deC8a25696E1C19a8659CbF95d', abi, provider);

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', async () => {
  console.log('Ready!', Date.now());

  const discordChannel = client.channels.cache.get('966574057279610930');

  aavegotchiDiamond.on("GotchiLendingAdd", async (listingId) => {
    const lendingInfo = await aavegotchiDiamond.getGotchiLendingListingInfo(listingId);

    if (lendingInfo.listing_.thirdParty == '0xE237122dbCA1001A9A3c1aB42CB8AE0c7bffc338' && lendingInfo.listing_.revenueSplit[2] >= 1) {
      const name = lendingInfo.aavegotchiInfo_.name;
      const ghst = ethers.utils.formatEther(lendingInfo.listing_.initialCost);
      const duration = lendingInfo.listing_.period / 3600;
      const split = `${lendingInfo.listing_.revenueSplit[0]}-${lendingInfo.listing_.revenueSplit[1]}-${lendingInfo.listing_.revenueSplit[2]}`;
      const url = `https://app.aavegotchi.com/lending/${lendingInfo.listing_.listingId}`;

      discordChannel.send(
        `Gotchi ${name} has been listed for rent: ${ghst} GHST, for ${duration} hours, at ${split} - ${url}`
      );
    }
  });

});

client.login(token);
