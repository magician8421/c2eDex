const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  const { query } = req;
  try {
    const responseOne = await Moralis.EvmApi.token.getTokenPrice({
      address: query.addressOne,
    });
    const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
      address: query.addressTwo,
    });
    const usdPrices = {
      tokenOne: responseOne.raw.usdPrice,
      tokenTwo: responseTwo.raw.usdPrice,
      ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice,
    };
    return res.status(200).json(usdPrices);
  } catch (e) {
    console.error(e);
    return res.status(200).json({});
  }
});

app.get("/allowance", async (req, res) => {
  const { query } = req;
  try {
    const response = await checkAllowance(
      query.tokenAddress,
      query.walletAddress
    );
    console.log(response);
    if (response.data) {
      return res.status(200).json(response.data);
    } else {
      return res.status(200).json({});
    }
  } catch (e) {
    console.error(e);
    return res.status(200).json({});
  }
});

async function checkAllowance(_tokenAddress, _walletAddress) {
  const url = "https://api.1inch.dev/swap/v6.0/1/approve/allowance";

  const config = {
    headers: {
      Authorization: "Bearer Ql5JDo6w9KsrYiN9y8JbH2im9DZehsIA",
    },
    params: {
      tokenAddress: _tokenAddress,
      walletAddress: _walletAddress,
    },
  };

  try {
    return await axios.get(url, config);
  } catch (error) {
    console.error(error);
    return error;
  }
}

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
