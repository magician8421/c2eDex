const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

const NUMBER_1E18 = "1000000000000000000";
const DEV_MOCK_TOKEN_APPROVE = BigInt(100000000 * NUMBER_1E18);

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
  if (process.env.ENV == "dev") {
    return res
      .status(200)
      .json({ allowance: DEV_MOCK_TOKEN_APPROVE.toString() });
  }

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

app.get("/approve", async (req, res) => {
  const { query } = req;
  try {
    const response = await tokenApprove(query.tokenAddress, query.amount);
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

app.get("/swap", async (req, res) => {
  const { query } = req;
  try {
    const response = await tokenSwap(
      query.tokenSrc,
      query.tokenTarget,
      query.amount,
      query.from,
      query.slippage
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
async function tokenApprove(_tokenAddress, _amount) {
  const url = "https://api.1inch.dev/swap/v6.0/1/approve/transaction";

  const config = {
    headers: {
      Authorization: "Bearer Ql5JDo6w9KsrYiN9y8JbH2im9DZehsIA",
    },
    params: {
      tokenAddress: _tokenAddress,
      amount: _amount,
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function tokenSwap(_tokenSrc, _tokenTarget, _amount, _from, _slippage) {
  const url = "https://api.1inch.dev/swap/v6.0/1/swap";

  const config = {
    headers: {
      Authorization: "Bearer Ql5JDo6w9KsrYiN9y8JbH2im9DZehsIA",
    },
    params: {
      src: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      dst: "0x514910771af9ca656af840dff83e8264ecf986ca",
      amount: "10000000000000000",
      from: "0x9d2a28B4B23BBF47B6a6aD575bD9e83385453a35",
      origin: "0x9d2a28B4B23BBF47B6a6aD575bD9e83385453a35",
      slippage: "1",
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
