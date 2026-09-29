(function () {
  "use strict";
  if (typeof window === "undefined" || typeof window.ethers === "undefined") return;

  var CFG = window.APP_CONFIG;
  var L = window.MintLogic;
  var $ = function (id) { return document.getElementById(id); };
  var ethers = window.ethers;

  var readProvider = new ethers.JsonRpcProvider(
    CFG.rpcUrl,
    { chainId: CFG.chainId, name: CFG.chainName },
    { staticNetwork: true }
  );
  var read = new ethers.Contract(CFG.contract, CFG.abi, readProvider);

  var S = {
    account: null,
    chainOk: false,
    busy: false,
    qty: 1,
    timeOffset: 0,
    activity: [],
    name: "NFT",
    symbol: "NFT",
    paused: true,
    reveal: true,
    totalSupply: 0,
    maxSupply: 10000,
    freeMinted: 0,
    paidMinted: 0,
    freeMintSupply: 10000,
    paidMintSupply: 10000,
    cost: 0n,
    maxTx: 20,
    maxFreePerWallet: 1,
    maxPaidPerWallet: 20,
    cooldown: 2,
    lastFreeTs: 0,
    payout: "",
    freeMints: 0,
    paidMints: 0,
    owned: 0,
    walletEth: 0n,
  };

  function now() { return Math.floor(Date.now() / 1000) + S.timeOffset; }
  function supplyLeft() { return Math.max(0, Number(S.maxSupply) - Number(S.totalSupply)); }

  function freeStatus() {
    return L.freeMintStatus({
      paused: S.paused, totalSupply: S.totalSupply, maxSupply: S.maxSupply,
      freeMinted: S.freeMinted, freeMintSupply: S.freeMintSupply,
      freeMints: S.freeMints, maxFreePerWallet: S.maxFreePerWallet,
      cooldown: S.cooldown, lastFreeTs: S.lastFreeTs, now: now(), account: S.account,
    });
  }
  function paidStatus() {
    return L.paidMintStatus({
      paused: S.paused, account: S.account, totalSupply: S.totalSupply, maxSupply: S.maxSupply,
      paidMints: S.paidMints, maxPaidPerWallet: S.maxPaidPerWallet, maxTx: S.maxTx,
      cost: S.cost, qty: S.qty, supplyLeft: supplyLeft(), balance: S.walletEth,
    });
  }

  async function loadGlobal() {
    var r = await Promise.all([
      read.paused(), read.totalSupply(), read.maxSupply(), read.cost(),
      read.maxMintAmountPerTx(), read.maxFreeMintAmountPerWallet(), read.maxPaidMintAmountPerWallet(),
      read.freeMintCooldown(), read.freeNFTAlreadyMinted(), read.paidNFTAlreadyMinted(),
      read.lastFreeMintTimestamp(), read.payoutReceiver(), read.name(), read.symbol(),
      read.freeMintSupply(), read.paidMintSupply(),
      readProvider.getBlock("latest"),
    ]);
    S.paused = r[0];
    S.totalSupply = Number(r[1]);
    S.maxSupply = Number(r[2]);
    S.cost = r[3];
    S.maxTx = Number(r[4]);
    S.maxFreePerWallet = Number(r[5]);
    S.maxPaidPerWallet = Number(r[6]);
    S.cooldown = Number(r[7]);
    S.freeMinted = Number(r[8]);
    S.paidMinted = Number(r[9]);
    S.lastFreeTs = Number(r[10]);
    S.payout = r[11];
    S.name = r[12];
    S.symbol = r[13];
    S.reveal = true;
    S.freeMintSupply = Number(r[14]);
    S.paidMintSupply = Number(r[15]);
    if (r[16] && r[16].timestamp) S.timeOffset = Number(r[16].timestamp) - Math.floor(Date.now() / 1000);
  }

  async function loadWallet() {
    if (!S.account) {
      S.freeMints = 0; S.paidMints = 0; S.owned = 0; S.walletEth = 0n;
      return;
    }
    var r = await Promise.all([
      read.freeMintsPerWallet(S.account),
      read.paidMintsPerWallet(S.account),
      read.balanceOf(S.account),
      readProvider.getBalance(S.account),
    ]);
    S.freeMints = Number(r[0]);
    S.paidMints = Number(r[1]);
    S.owned = Number(r[2]);
    S.walletEth = r[3];
    S.qty = L.clampQty(S.qty, S.maxTx, S.maxPaidPerWallet - S.paidMints, supplyLeft());
  }

  async function refresh() {
    try {
      await Promise.all([loadGlobal(), loadWallet()]);
      render();
    } catch (e) {
      console.error("refresh failed", e);
      toast("Could not read chain state: " + L.errText(e), "error");
    }
  }

  /* ---------------- rendering ---------------- */

  function render() {
    var pct = S.maxSupply ? Math.min(100, (S.totalSupply / S.maxSupply) * 100) : 0;
    $("progressFill").style.width = pct.toFixed(2) + "%";
    $("progressLabel").textContent = S.totalSupply.toLocaleString() + " / " + S.maxSupply.toLocaleString() + " minted";
    $("statMinted").textContent = S.totalSupply.toLocaleString();
    $("statSupply").textContent = S.maxSupply.toLocaleString();
    $("statPrice").textContent = S.paused ? "—" : L.fmtEth(S.cost) + " ETH";
    $("statYours").textContent = S.account ? S.owned.toLocaleString() : "—";

    $("brandName").textContent = S.name;
    $("brandSymbol").textContent = S.symbol;
    $("heroTitle").textContent = S.name;
    $("heroSub").textContent = S.symbol + " on " + CFG.chainName + (S.reveal ? " · revealed" : " · metadata hidden");

    $("cPaused").textContent = S.paused ? "paused" : "open";
    $("cPaused").className = "pill " + (S.paused ? "pill-warn" : "pill-ok");
    $("cReveal").textContent = S.reveal ? "revealed" : "hidden";

    renderFree();
    renderPaid();
    renderWallet();
    renderNetwork();
    renderActivity();
  }

  function renderFree() {
    var st = freeStatus();
    $("freeStatus").textContent = st.label;
    $("freeHint").textContent = st.hint;
    $("freeBtn").textContent = st.label;
    $("freeBtn").disabled = !st.ok || S.busy;
    $("freeBtn").classList.toggle("primary", st.ok);
  }

  function renderPaid() {
    var st = paidStatus();
    $("payEach").textContent = L.fmtEth(S.cost) + " ETH each";
    $("payQty").value = S.qty;
    $("payTotal").textContent = st.totalEth + " ETH";
    $("payStatus").textContent = st.label;
    $("payHint").textContent = st.hint;
    $("payBtn").textContent = st.label;
    $("payBtn").disabled = !st.ok || S.busy;
    $("payBtn").classList.toggle("primary", st.ok);
    var maxAllowed = Math.min(S.maxTx, S.maxPaidPerWallet - S.paidMints, supplyLeft());
    $("payQtyMinus").disabled = S.qty <= 1 || S.busy;
    $("payQtyPlus").disabled = S.qty >= Math.max(1, maxAllowed) || S.busy;
    $("payQtyMax").disabled = maxAllowed < 1 || S.busy;
  }

  function renderWallet() {
    if (!S.account) {
      $("wAddress").textContent = "Not connected";
      $("wOwned").textContent = "—";
      $("wFree").textContent = "—";
      $("wPaid").textContent = "—";
      $("wEth").textContent = "—";
      $("wCooldown").textContent = "—";
      return;
    }
    $("wAddress").textContent = L.shortAddr(S.account);
    $("wAddress").title = S.account;
    $("wOwned").textContent = S.owned.toLocaleString();
    $("wFree").textContent = S.freeMints + " / " + S.maxFreePerWallet;
    $("wPaid").textContent = S.paidMints + " / " + S.maxPaidPerWallet;
    $("wEth").textContent = L.fmtEth(S.walletEth) + " ETH";
    var left = Number(S.lastFreeTs) + Number(S.cooldown) - now();
    $("wCooldown").textContent = left > 0 ? left + "s" : "ready";
  }

  function renderNetwork() {
    var badge = $("networkBadge");
    var btn = $("connectBtn");
    if (!window.ethereum) {
      badge.textContent = "no wallet";
      badge.className = "net net-warn";
      btn.textContent = "Install MetaMask";
      return;
    }
    if (!S.account) {
      badge.textContent = CFG.chainName;
      badge.className = "net net-idle";
      btn.textContent = "Connect wallet";
      return;
    }
    if (!S.chainOk) {
      badge.textContent = "wrong network";
      badge.className = "net net-warn";
      btn.textContent = "Switch network";
      return;
    }
    badge.textContent = CFG.chainName + " ✓";
    badge.className = "net net-ok";
    btn.textContent = L.shortAddr(S.account);
  }

  function renderActivity() {
    var el = $("activityList");
    if (!S.activity.length) {
      el.innerHTML = '<div class="empty">No transactions yet</div>';
      return;
    }
    el.innerHTML = S.activity.slice(0, 8).map(function (a) {
      var link = a.hash
        ? '<a href="' + CFG.explorer + "/tx/" + a.hash + '" target="_blank" rel="noopener">view</a>'
        : "";
      return (
        '<div class="act-row"><span class="act-label">' + escapeHtml(a.label) + "</span>" +
        '<span class="act-status st-' + a.status + '">' + a.status + (a.error ? " · " + escapeHtml(a.error) : "") + "</span>" +
        "<span>" + link + "</span></div>"
      );
    }).join("");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------------- toasts ---------------- */

  function toast(msg, type, hash) {
    var box = $("toasts");
    var el = document.createElement("div");
    el.className = "toast toast-" + (type || "info");
    var link = hash
      ? ' <a href="' + CFG.explorer + "/tx/" + hash + '" target="_blank" rel="noopener">explorer</a>'
      : "";
    el.innerHTML = "<span>" + escapeHtml(msg) + "</span>" + link;
    box.appendChild(el);
    setTimeout(function () { el.classList.add("out"); }, 5200);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 6000);
  }

  function pushActivity(label) {
    var entry = { label: label, hash: null, status: "signing", error: null };
    S.activity.unshift(entry);
    renderActivity();
    return entry;
  }

  /* ---------------- wallet / chain ---------------- */

  async function connect() {
    if (!window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return null;
    }
    var bp = new ethers.BrowserProvider(window.ethereum);
    var accounts = await bp.send("eth_requestAccounts", []);
    S.account = ethers.getAddress(accounts[0]);
    await checkChain();
    await loadWallet();
    render();
    return S.account;
  }

  async function checkChain() {
    if (!window.ethereum) { S.chainOk = false; return false; }
    var hexId = await window.ethereum.request({ method: "eth_chainId" });
    S.chainOk = parseInt(hexId, 16) === CFG.chainId;
    return S.chainOk;
  }

  async function ensureChain() {
    if (!window.ethereum) throw new Error("No wallet found — install MetaMask");
    await checkChain();
    if (S.chainOk) return;
    var hexId = "0x" + CFG.chainId.toString(16);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
    } catch (e) {
      if (e && e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: hexId,
            chainName: CFG.chainName,
            rpcUrls: [CFG.rpcUrl],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: [CFG.explorer],
          }],
        });
      } else {
        throw e;
      }
    }
    await checkChain();
    render();
    if (!S.chainOk) throw new Error("Wrong network — switch your wallet to " + CFG.chainName + " (chain id " + CFG.chainId + ")");
  }

  async function sendTx(fnName, args, value, label) {
    if (S.busy) return;
    var entry = pushActivity(label);
    S.busy = true;
    render();
    try {
      if (!S.account) await connect();
      await ensureChain();
      var bp = new ethers.BrowserProvider(window.ethereum);
      var signer = await bp.getSigner();
      var c = new ethers.Contract(CFG.contract, CFG.abi, signer);
      var overrides = value && value > 0n ? { value: value } : {};
      var tx = await c[fnName].apply(c, args.concat([overrides]));
      entry.hash = tx.hash;
      entry.status = "pending";
      renderActivity();
      toast(label + " submitted", "info", tx.hash);
      var rc = await tx.wait();
      entry.status = rc.status === 1 ? "confirmed" : "failed";
      toast(label + (rc.status === 1 ? " confirmed" : " failed"), rc.status === 1 ? "success" : "error", tx.hash);
    } catch (e) {
      entry.status = "failed";
      entry.error = L.errText(e);
      toast(entry.error, "error", entry.hash);
      console.error(e);
    } finally {
      S.busy = false;
      await refresh();
    }
  }

  /* ---------------- events ---------------- */

  function setQty(q) {
    S.qty = L.clampQty(q, S.maxTx, S.maxPaidPerWallet - S.paidMints, supplyLeft());
    renderPaid();
  }

  function bind() {
    $("connectBtn").addEventListener("click", function () {
      if (!window.ethereum) { window.open("https://metamask.io/download/", "_blank"); return; }
      if (S.account && !S.chainOk) { ensureChain().catch(function (e) { toast(L.errText(e), "error"); }); return; }
      if (S.account) return;
      connect().catch(function (e) { toast(L.errText(e), "error"); });
    });

    $("networkBadge").addEventListener("click", function () {
      if (window.ethereum && S.account && !S.chainOk) ensureChain().catch(function (e) { toast(L.errText(e), "error"); });
    });

    $("freeBtn").addEventListener("click", function () {
      sendTx("freeMint", [], 0n, "Free mint");
    });

    $("payBtn").addEventListener("click", function () {
      sendTx("mint", [S.qty], S.cost * BigInt(S.qty), "Paid mint ×" + S.qty);
    });

    $("payQtyMinus").addEventListener("click", function () { setQty(S.qty - 1); });
    $("payQtyPlus").addEventListener("click", function () { setQty(S.qty + 1); });
    $("payQtyMax").addEventListener("click", function () {
      setQty(Math.min(S.maxTx, S.maxPaidPerWallet - S.paidMints, supplyLeft()));
    });
    $("payQty").addEventListener("change", function () { setQty(parseInt(this.value, 10)); });

    $("copyContract").addEventListener("click", function () { copy(CFG.contract); });

    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on("accountsChanged", function (accs) {
        S.account = accs && accs.length ? ethers.getAddress(accs[0]) : null;
        refresh();
      });
      window.ethereum.on("chainChanged", function () {
        checkChain().then(render);
      });
    }
  }

  function copy(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied", "success"); },
        function () { toast("Copy failed", "error"); });
    } else {
      toast(text, "info");
    }
  }

  /* ---------------- boot ---------------- */

  function tick() {
    if (!S.paused) renderFree();
    renderWallet();
  }

  async function boot() {
    bind();
    if (window.ethereum) {
      try {
        var accs = await window.ethereum.request({ method: "eth_accounts" });
        if (accs && accs.length) S.account = ethers.getAddress(accs[0]);
      } catch (e) { /* ignore */ }
      await checkChain();
    }
    await refresh();
    setInterval(refresh, 15000);
    setInterval(tick, 500);
    document.body.classList.add("ready");
    window.__mintApp = { S: S, refresh: refresh };
  }

  boot().catch(function (e) {
    console.error(e);
    toast("Failed to start: " + L.errText(e), "error");
  });
})();
