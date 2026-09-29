(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.MintLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function shortAddr(a) {
    if (!a) return "";
    return a.slice(0, 6) + "…" + a.slice(-4);
  }

  // 18-decimal bigint -> ETH string, no exponent
  function fmtEth(wei) {
    var v = BigInt(wei);
    var neg = v < 0n;
    if (neg) v = -v;
    var whole = v / 1000000000000000000n;
    var frac = (v % 1000000000000000000n).toString().padStart(18, "0").replace(/0+$/, "");
    return (neg ? "-" : "") + whole.toString() + (frac ? "." + frac : "");
  }

  function clampQty(qty, maxTx, maxPaidRemaining, supplyLeft) {
    var caps = [Number(maxTx || 0), Number(maxPaidRemaining || 0), Number(supplyLeft || 0)];
    var cap = Math.min.apply(null, caps.filter(function (c) { return isFinite(c); }));
    if (!isFinite(cap) || cap < 0) cap = 0;
    var q = Math.floor(Number(qty) || 0);
    if (q < 1) q = 1;
    if (q > cap) q = cap;
    if (cap < 1) q = 0;
    return q;
  }

  function freeMintStatus(s) {
    if (s.paused) return { ok: false, label: "Mint paused", hint: "Sale is not open yet", action: "none" };
    if (Number(s.totalSupply) >= Number(s.maxSupply)) return { ok: false, label: "Sold out", hint: "Max supply reached", action: "none" };
    if (Number(s.freeMinted) >= Number(s.freeMintSupply)) return { ok: false, label: "No free mints left", hint: "Free allocation exhausted", action: "none" };
    if (!s.account) return { ok: false, label: "Connect wallet", hint: "Connect to claim your free NFT", action: "connect" };
    if (Number(s.freeMints) >= Number(s.maxFreePerWallet)) {
      return {
        ok: false,
        label: "Already claimed",
        hint: s.freeMints + " / " + s.maxFreePerWallet + " free mint used (lifetime)",
        action: "none",
      };
    }
    var remaining = Number(s.lastFreeTs) + Number(s.cooldown) - Number(s.now);
    if (remaining > 0) {
      return {
        ok: false,
        label: "Wait " + remaining + "s",
        hint: "Global cooldown — next free mint in " + remaining + "s",
        action: "none",
        cooldown: remaining,
      };
    }
    return {
      ok: true,
      label: "Mint free NFT",
      hint: s.freeMints + " / " + s.maxFreePerWallet + " used · " + s.cooldown + "s global cooldown",
      action: "mint",
    };
  }

  function paidMintStatus(s) {
    var qty = Number(s.qty) || 0;
    var total = BigInt(s.cost || 0n) * BigInt(qty);
    var out = {
      ok: false,
      label: "Mint",
      hint: "",
      action: "none",
      qty: qty,
      total: total,
      totalEth: fmtEth(total),
    };
    if (s.paused) { out.label = "Mint paused"; out.hint = "Sale is not open yet"; return out; }
    if (!s.account) { out.label = "Connect wallet"; out.hint = "Connect to mint"; out.action = "connect"; return out; }
    if (Number(s.totalSupply) >= Number(s.maxSupply)) { out.label = "Sold out"; out.hint = "Max supply reached"; return out; }
    if (Number(s.paidMints) >= Number(s.maxPaidPerWallet)) {
      out.label = "Wallet cap reached";
      out.hint = s.paidMints + " / " + s.maxPaidPerWallet + " paid mints used (lifetime)";
      return out;
    }
    if (qty < 1) { out.label = "Pick a quantity"; out.hint = "Minimum 1"; return out; }
    if (qty > Number(s.maxTx)) { out.label = "Max " + s.maxTx + " per transaction"; out.hint = "Reduce quantity"; return out; }
    if (qty > Number(s.maxPaidPerWallet) - Number(s.paidMints)) {
      out.label = "Only " + (Number(s.maxPaidPerWallet) - Number(s.paidMints)) + " left in wallet cap";
      out.hint = s.paidMints + " / " + s.maxPaidPerWallet + " paid mints used";
      return out;
    }
    if (qty > Number(s.supplyLeft)) { out.label = "Not enough supply"; out.hint = "Only " + s.supplyLeft + " left"; return out; }
    if (BigInt(s.balance || 0n) < total) {
      out.label = "Insufficient ETH";
      out.hint = "Need " + fmtEth(total) + " ETH + gas";
      return out;
    }
    out.ok = true;
    out.action = "mint";
    out.label = "Mint " + qty + (qty === 1 ? " NFT" : " NFTs");
    out.hint = fmtEth(total) + " ETH + gas";
    return out;
  }

  function errText(e) {
    if (!e) return "Unknown error";
    if (e.code === 4001 || e.code === "ACTION_REJECTED") return "Transaction rejected in wallet";
    var parts = [];
    if (e.reason) parts.push(e.reason);
    if (e.shortMessage) parts.push(e.shortMessage);
    if (e.revert && e.revert.args && e.revert.args[0]) parts.push(String(e.revert.args[0]));
    if (e.info && e.info.error && e.info.error.message) parts.push(e.info.error.message);
    if (e.message) parts.push(e.message);
    var msg = parts.join(" | ");
    var m = msg.match(/"([^"]+)"/) || msg.match(/'([^']+)'/) || msg.match(/reason string: "([^"]+)"/);
    if (m && m[1] && m[1].length < 120) return m[1];
    if (e.code === "INSUFFICIENT_FUNDS") return "Not enough ETH for gas";
    if (e.code === "CALL_EXCEPTION" && e.reason) return e.reason;
    return String(msg).split("\n")[0].slice(0, 160);
  }

  return { shortAddr: shortAddr, fmtEth: fmtEth, clampQty: clampQty, freeMintStatus: freeMintStatus, paidMintStatus: paidMintStatus, errText: errText };
});
