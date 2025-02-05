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
  console.log(
    "start swap,src=%s,target=%s,amount=%s,from=%s,slippage=%s",
    _tokenSrc,
    _tokenTarget,
    _amount,
    _from,
    _slippage
  );

  const config = {
    headers: {
      Authorization: "Bearer Ql5JDo6w9KsrYiN9y8JbH2im9DZehsIA",
    },
    params: {
      src: _tokenSrc,
      dst: _tokenTarget,
      amount: _amount,
      from: _from,
      origin: _from,
      slippage: _slippage,
      disableEstimate: "true",
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

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
