import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import tokenLists from "../tokenList.json";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
function Swap() {
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenLists[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenLists[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  }
  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }
  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    //useState的更新并不是实时的，所以需要中间变量做过度
    const _tokenOne = tokenOne;
    const _tokenTow = tokenTwo;
    setTokenOne(_tokenTow);
    setTokenTwo(_tokenOne);
    fetchPrices(_tokenTow.address, _tokenOne.address);
  }
  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }
  function modifyToken(index) {
    setPrices(null);
    setTokenTwoAmount(null);
    setTokenOneAmount(null);
    if (changeToken == 1) {
      setTokenOne(tokenLists[index]);
      fetchPrices(tokenLists[index].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenLists[index]);
      fetchPrices(tokenOne.address, tokenLists[index].address);
    }

    setIsOpen(false);
  }

  function initialFinised() {
    return prices != null;
  }

  async function fetchPrices(one, two) {
    const res = await axios.get("http://localhost:3001/tokenPrice", {
      params: { addressOne: one, addressTwo: two },
    });
    console.log(
      " fetch price from %s to %s,result=%s",
      one,
      two,
      JSON.stringify(res.data)
    );
    setPrices(res.data);
    return res.data;
  }
  useEffect(() => {
    fetchPrices(tokenLists[0].address, tokenLists[1].address);
  }, []);
  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );
  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenLists?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            disabled={!initialFinised()}
            onChange={changeAmount}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetTwoLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount}>
          Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
