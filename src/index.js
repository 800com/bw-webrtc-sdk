const JsSIP = require("jssip");

/*
 * AudioCodes WebRTC API
 * Â© 2024 AudioCodes Ltd. All rights reserved.
 * Downloaded from https://demo.webrtc.audiocodes.com/sdk/webrtc-api-base/js/ac_webrtc.min.js and then formatted so we can easier debug what's going on in the code
 * Version "1.20.0"
 *
 */ 
class AudioCodesUA {
  constructor() {
    return (
      (this._isInitialized = !1),
      (this.serverConfig = {}),
      (this.account = {
        user: null,
        userAuth: null,
        displayName: null,
        password: null,
        registerExpires: 600,
        useSessionTimer: !1,
      }),
      (this.constraints = { audio: !0, video: !0 }),
      (this.chromiumBased = [
        { n: "Edge", s: "edg/" },
        { n: "Opera", s: "opr/" },
        { n: "Samsung", s: "samsungbrowser/" },
        { n: "Yandex", s: "yabrowser/" },
      ]),
      (this.modes = {
        video_call_audio_answer_firefox_fix: !0,
        video_call_audio_answer_safari_fix: !0,
        ice_timeout_fix: 2e3,
        chrome_rtp_timeout_fix: 13,
        sbc_ha_pairs_mode: void 0,
        ringing_header_mode: void 0,
        sbc_switch_register5xx_mode: !0,
        cache_register_auth_mode: !0,
        check_remote_sdp_mode: !0,
      }),
      (this.credentials = []),
      (this.listeners = {}),
      (this.registerExtraHeaders = null),
      (this.jssipUA = null),
      (this.browser = ""),
      (this.browserVersion = 0),
      (this.browserName = ""),
      (this.os = "other"),
      (this.reconnectMin = 2),
      (this.reconnectMax = 30),
      (this.u17 = void 0),
      (this.activeCalls = 0),
      (this.wsPingStarted = !1),
      (this.wsSocket = null),
      (this.wsOnMessage = null),
      (this.wsPingMs = 0),
      (this.wsOrigPingMs = 0),
      (this.wsThrottlingPingMs = 0),
      (this.wsVisibility = !1),
      (this.wsCall = !1),
      (this.wsLog = 0),
      (this.wsPongTimeout = !0),
      (this.wsIsThrottling = !1),
      (this.wsPingJob = null),
      (this.wsPingTime = null),
      (this.wsNextPingTime = null),
      (this.wsPongReceived = !1),
      (this.wsPongSupported = null),
      (this.wsPongTimeoutTime = null),
      (this.wsPongDelays = null),
      (this.wsPongDelaysIx = 0),
      (this.wsPongReport = 0),
      (this.wsPongReportCounter = 0),
      (this.wsPongDist = !1),
      (this.wsIsPingDebugLog = !1),
      (this.dtmfUseWebRTC = !0),
      (this.dtmfDuration = 250),
      (this.dtmfInterToneGap = 250),
      (this.enableAddVideo = !1),
      (this.oauthToken = null),
      (this.oauthTokenUseInInvite = !0),
      (this.networkPriority = void 0),
      (this.noAnswerTimeout = 60),
      (AudioCodesUA.ac_log = console.log),
      (AudioCodesUA.js_log = null),
      void 0 === AudioCodesUA.instance && (AudioCodesUA.instance = this),
      this._detectBrowser(),
      this._detectOS(),
      (this.webrtcapi = AudioCodesWebRTCWrapper),
      (this.replacedCall = null),
      (this.codecFilter = null),
      (this.AUDIO = Symbol("audio")),
      (this.VIDEO = Symbol("video")),
      (this.RECVONLY_VIDEO = Symbol("recvonly_video")),
      AudioCodesUA.instance
    );
  }
  version() {
    return "1.20.0";
  }
  getBrowserName() {
    return this.browserName;
  }
  getBrowser() {
    return this.browser;
  }
  getBrowserVersion() {
    return this.browserVersion;
  }
  getOS() {
    return this.os;
  }
  getWR() {
    return this.webrtcapi;
  }
  checkAvailableDevices() {
    return this.getWR().checkAvailableDevices();
  }
  getServerAddress() {
    if (null === this.wsSocket) return null;
    let e = this.wsSocket.url;
    return e.endsWith("/") && (e = e.slice(0, -1)), e;
  }
  setOAuthToken(e, i = !0) {
    (this.oauthToken = e),
      (this.oauthTokenUseInInvite = i),
      this.setRegisterExtraHeaders(this.registerExtraHeaders);
  }
  setUserAgent(e) {
    this.u17 = e;
  }
  setConstraints(e, i, s) {
    let t = this.browser,
      o = this.browser + "|" + this.os;
    if (null === e || e === t || e === o) {
      if (
        (AudioCodesUA.ac_log(
          `AC: setConstraints ${e} ${i}  ${JSON.stringify(s)}`
        ),
        "audio" !== i && "video" !== i)
      )
        throw new TypeError(`Wrong type: ${i}`);
      this.constraints[i] = s;
    } else
      AudioCodesUA.ac_log(
        `AC: setConstraints ${e} - ignored, no current browser`
      );
  }
  setConstraint(e, i, s) {
    if (
      (null !== s && void 0 !== s
        ? AudioCodesUA.ac_log(
            `AC: setConstraint ${e} ${i}=${JSON.stringify(s)}`
          )
        : AudioCodesUA.ac_log(`AC: setConstraint remove ${e} ${i}`),
      "audio" !== e && "video" !== e)
    )
      throw new TypeError(`Wrong type: ${e}`);
    null !== s && void 0 !== s
      ? (!0 === this.constraints[e] && (this.constraints[e] = {}),
        (this.constraints[e][i] = s))
      : !0 !== this.constraints[e] &&
        !1 !== this.constraints[e] &&
        (delete this.constraints[e][i],
        0 === Object.keys(this.constraints[e]).length &&
          (this.constraints[e] = !0));
  }
  setBrowsersConstraints(e) {
    let i = this.browser,
      s = this.browser + "|" + this.os;
    for (let t in e) {
      if (t !== i && t !== s) continue;
      let o = e[t];
      void 0 !== o.audio && this.setConstraints(t, "audio", o.audio),
        void 0 !== o.video && this.setConstraints(t, "video", o.video);
    }
  }
  setCodecFilter(e) {
    e &&
      (AudioCodesUA.ac_log(`AC: setCodecFilter ${JSON.stringify(e)}`),
      (this.codecFilter = this._cf_unpack(e)));
  }
  setServerConfig(e, i, s = []) {
    (this.serverConfig = {
      addresses: e,
      domain: i,
      iceServers: this._convertIceList(s),
    }),
      AudioCodesUA.ac_log(
        `AC: setServerConfig() ${JSON.stringify(this.serverConfig)}`
      );
  }
  setReconnectIntervals(e, i) {
    AudioCodesUA.ac_log(`AC: setReconnectIntervals min=${e} max=${i}`),
      (this.reconnectMin = e),
      (this.reconnectMax = i);
  }
  setAccount(e, i, s, t) {
    (void 0 !== i && null !== i && 0 !== i.length) || (i = void 0),
      (void 0 !== t && null !== t && 0 !== t.length) || (t = e);
    let o = this.account;
    (o.user = e), (o.displayName = i), (o.password = s), (o.authUser = t);
  }
  setRegisterExpires(e) {
    AudioCodesUA.ac_log(`AC: setRegisterExpires=${e}`),
      (this.account.registerExpires = e);
  }
  setUseSessionTimer(e) {
    AudioCodesUA.ac_log(`AC: setUseSessionTimer=${e}`),
      (this.account.useSessionTimer = e);
  }
  setDtmfOptions(e, i = null, s = null) {
    AudioCodesUA.ac_log(
      `AC: setDtmfOptions useWebRTC=${e} duration=${i} interToneGap=${s}`
    ),
      (this.dtmfUseWebRTC = e),
      null !== i && (this.dtmfDuration = i),
      null !== s && (this.dtmfInterToneGap = s);
  }
  setEnableAddVideo(e) {
    AudioCodesUA.ac_log(`AC: setEnableAddVideo=${e}`),
      (this.enableAddVideo = e);
  }
  getEnableAddVideo() {
    return this.enableAddVideo;
  }
  getAccount() {
    return this.account;
  }
  setListeners(e) {
    AudioCodesUA.ac_log("AC: setListeners()");
    for (let i of [
      "loginStateChanged",
      "outgoingCallProgress",
      "callTerminated",
      "callConfirmed",
      "callShowStreams",
      "incomingCall",
      "callHoldStateChanged",
    ])
      if (!(i in e)) throw new Error(`${i} listener is missed`);
    this.listeners = e;
  }
  static getSessionStatusName(e) {
    switch (e) {
      case 0:
        return "NULL (0)";
      case 1:
        return "INVITE_SENT (1)";
      case 2:
        return "1XX_RECEIVED (2)";
      case 3:
        return "INVITE_RECEIVED (3)";
      case 4:
        return "WAITING_FOR_ANSWER (4)";
      case 5:
        return "ANSWERED (5)";
      case 6:
        return "WAITING_FOR_ACK (6)";
      case 7:
        return "CANCELED (7)";
      case 8:
        return "TERMINATED (8)";
      case 9:
        return "CONFIRMED (9)";
      default:
        return "Unknown (" + e + ")";
    }
  }
  setAcLogger(e) {
    AudioCodesUA.ac_log = e;
  }
  setJsSipLogger(e) {
    AudioCodesUA.js_log = e;
  }
  isInitialized() {
    return this._isInitialized;
  }
  setModes(e = {}) {
    AudioCodesUA.ac_log(`AC: setModes() ${JSON.stringify(e)}`),
      Object.assign(this.modes, e),
      this._normalizeModes();
  }
  _normalizeModes() {
    function e(e, i) {
      return "number" == typeof e && e <= i ? void 0 : e;
    }
    let i = this.modes;
    (i.sbc_ha_pairs_mode = e(i.sbc_ha_pairs_mode, 0)),
      (i.chrome_rtp_timeout_fix = e(i.chrome_rtp_timeout_fix, 0));
  }
  init(e = !0) {
    if ((AudioCodesUA.ac_log(`AC: init() autoLogin=${e}`), this._isInitialized))
      return;
    (this._isInitialized = !0),
      JsSIP.debug.enable("JsSIP:*"),
      (JsSIP.debug.formatArgs = function () {
        AudioCodesUA.js_log && (this.log = AudioCodesUA.js_log);
      });
    let i = [];
    for (let e of this.serverConfig.addresses)
      e instanceof Array
        ? i.push({ socket: new JsSIP.WebSocketInterface(e[0]), weight: e[1] })
        : i.push(new JsSIP.WebSocketInterface(e));
    let s = {
      sockets: i,
      uri: "sip:" + this.account.user + "@" + this.serverConfig.domain,
      contact_uri:
        "sip:" +
        this.account.user +
        "@" +
        this._randomToken(12) +
        ".invalid;transport=ws",
      authorization_user: this.account.authUser,
      password: this.account.password,
      register: e,
      session_timers: this.account.useSessionTimer,
      register_expires: this.account.registerExpires,
      user_agent: this.u17,
      connection_recovery_min_interval: this.reconnectMin,
      connection_recovery_max_interval: this.reconnectMax,
      no_answer_timeout: this.noAnswerTimeout,
    };
    this.account.displayName &&
      this.account.displayName.length > 0 &&
      (s.display_name = this.account.displayName),
      (this.jssipUA = new JsSIP.UA(s)),
      this.setRegisterExtraHeaders(this.registerExtraHeaders),
      this._setUACallbacks(),
      AudioCodesUA.ac_log(
        `AC: applied SDK modes: ${JSON.stringify(this.modes, (e, i) =>
          void 0 === i ? "<undefined>" : i
        )}`
      ),
      (this.jssipUA.modes = this.modes);
    for (let e of this.credentials) this.jssipUA.addCredential(e);
    (this.credentials = []), this.jssipUA.start();
  }
  deinit() {
    (this._isInitialized = !1), this.jssipUA && this.jssipUA.stop();
  }
  setRegisterExtraHeaders(e) {
    if (((this.registerExtraHeaders = e), this.jssipUA)) {
      let i = null !== e ? e : [];
      null !== this.oauthToken &&
        (i = i.slice()).push(`Authorization: Bearer ${this.oauthToken}`),
        this.jssipUA.registrator().setExtraHeaders(i);
    }
  }
  getRegisterExtraHeaders() {
    return this.registerExtraHeaders;
  }
  login() {
    AudioCodesUA.ac_log("AC: login()"), this.jssipUA.register();
  }
  logout() {
    AudioCodesUA.ac_log("AC: logout()"),
      this.jssipUA.isRegistered() && this.jssipUA.unregister();
  }
  switchSBC(e = !0) {
    return AudioCodesUA.ac_log("AC: switchSBC()"), this.jssipUA.switchSBC(e);
  }
  getNumberOfSBC() {
    return this.jssipUA.getNumberOfSBC();
  }
  setWebSocketKeepAlive(e, i = !0, s = !0, t = 0, o = !1) {
    if (
      (AudioCodesUA.ac_log(
        `AC: setWebSocketKeepAlive pingInterval=${e} pongTimeout=${i}` +
          ` timerThrottlingBestEffort=${JSON.stringify(
            s
          )} pongReport=${t} pongDist=${o}`
      ),
      "number" != typeof e || "boolean" != typeof i)
    )
      throw new TypeError(
        "setWebSocketKeepAlive: wrong type of first or second argument"
      );
    let n;
    (this.wsPingMs = this.wsOrigPingMs = 1e3 * e),
      (this.wsPongTimeout = i),
      (this.wsPongReport = t),
      (this.wsPongDist = o),
      (this.wsPongReportCounter = 0),
      (this.wsIsThrottling = !1);
    let r = (n =
      !0 === s
        ? { log: 0, chrome: { interval: 1, visibility: !0, call: !0, log: 1 } }
        : !1 === s
        ? { log: 0 }
        : s)[this.browser];
    (this.wsThrottlingPingMs =
      r && void 0 !== r.interval ? 1e3 * r.interval : 0),
      (this.wsVisibility = !(!r || void 0 === r.visibility) && r.visibility),
      (this.wsCall = !(!r || void 0 === r.call) && r.call),
      (this.wsLog = r && void 0 !== r.log ? r.log : n.log),
      (this.wsPongDelays = new Array(
        this.wsPongReport > 0 ? this.wsPongReport : 50
      )),
      (this.wsPongDelaysIx = 0),
      0 !== this.wsOrigPingMs &&
        0 !== this.wsThrottlingPingMs &&
        this.wsVisibility &&
        document.addEventListener(
          "visibilitychange",
          this._onVisibilityChange.bind(this)
        );
  }
  _pingLog() {
    return ` (ping=${this.wsPingMs / 1e3} sec)`;
  }
  _visibilityLog(e) {
    let i =
      "AC: keep-alive: Page is " + (document.hidden ? "hidden" : "visible");
    document.hidden &&
      (this.wsCall &&
        (i +=
          ", " + (0 === this.activeCalls ? "no active call" : "active call")),
      (i +=
        " and " + (this.wsIsThrottling ? "was" : "was not") + " trottling")),
      e && (i += this._pingLog()),
      AudioCodesUA.ac_log(i);
  }
  _activeCallsLog(e) {
    let i = `AC: keep-alive: ${
      0 === this.activeCalls ? "Call ended" : "Call started"
    }`;
    0 === this.activeCalls &&
      (this.wsVisibility &&
        (i += ", page is " + (document.hidden ? "hidden" : "visible")),
      (i +=
        " and " + (this.wsIsThrottling ? "was" : "was not") + " trottling")),
      e && (i += this._pingLog()),
      AudioCodesUA.ac_log(i);
  }
  _onActiveCallsChange(e) {
    if (
      ((this.activeCalls += e),
      this.wsCall && 0 !== this.wsPingMs && 0 !== this.wsThrottlingPingMs)
    )
      if (
        (this.activeCalls < 0 &&
          AudioCodesUA.ac_log("Warning: keep-alive: activeCalls < 0"),
        0 === this.activeCalls)
      ) {
        if (
          (!this.wsVisibility || document.hidden) &&
          this.wsIsThrottling &&
          this.wsPingMs < this.wsThrottlingPingMs
        )
          return (
            (this.wsPingMs = this.wsThrottlingPingMs),
            void this._activeCallsLog(!0)
          );
        this.wsLog >= 2 && this._activeCallsLog(!1);
      } else if (1 === this.activeCalls && e > 0) {
        if (this.wsPingMs > this.wsOrigPingMs)
          return (
            (this.wsPingMs = this.wsOrigPingMs), void this._activeCallsLog(!0)
          );
        this.wsLog >= 2 && this._activeCallsLog(!1);
      }
  }
  _onVisibilityChange() {
    if (
      this.wsVisibility &&
      0 !== this.wsPingMs &&
      0 !== this.wsThrottlingPingMs
    )
      if (document.hidden) {
        if (
          this.wsCall &&
          0 === this.activeCalls &&
          this.wsIsThrottling &&
          this.wsPingMs < this.wsThrottlingPingMs
        )
          return (
            (this.wsPingMs = this.wsThrottlingPingMs),
            void this._visibilityLog(!0)
          );
        this.wsLog >= 2 && this._visibilityLog(!1);
      } else {
        if (this.wsPingMs > this.wsOrigPingMs)
          return (
            (this.wsPingMs = this.wsOrigPingMs), void this._visibilityLog(!0)
          );
        this.wsLog >= 2 && this._visibilityLog(!1);
      }
  }
  _onMessageHook(e) {
    "\r\n" === e.data ? this._onPong() : this.wsOnMessage(e);
  }
  _onPong() {
    if (!this.wsPingStarted) return;
    let e;
    (this.wsPongReceived = !0),
      null === this.wsPongSupported &&
        (AudioCodesUA.ac_log("AC: keep-alive: Server supports CRLF pong"),
        (this.wsPongSupported = !0)),
      null !== this.wsPongTimeoutTime
        ? ((e = Date.now() - this.wsPongTimeoutTime),
          (this.wsPongTimeoutTime = null),
          AudioCodesUA.ac_log(
            `AC: keep-alive: Received pong that exceeded the timeout, delay=${e}`
          ))
        : (e = Date.now() - this.wsPingTime);
    let i = this.wsPingMs - e;
    i < 0 &&
      (AudioCodesUA.ac_log(
        `AC: nextPing calculated to ${i}ms, so resetting to 0ms.`
      ),
      (i = 0)),
      null !== this.wsPingJob && clearTimeout(this.wsPingJob),
      (this.wsPingJob = setTimeout(this._sendPing.bind(this), i)),
      (this.wsPongDelays[this.wsPongDelaysIx] = e),
      (this.wsPongDelaysIx = this.wsPongDelaysIx + 1),
      this.wsPongDelaysIx === this.wsPongDelays.length &&
        (this.wsPongDelaysIx = 0),
      this.wsPongReport > 0 && this.wsPongReportCounter++;
  }
  _onPongTimeout(e) {
    if (
      (AudioCodesUA.ac_log(
        `AC: keep-alive: Pong timeout (not received within ${e / 1e3} seconds)`
      ),
      AudioCodesUA.ac_log(
        `AC: keep-alive: Previous pongs statistics: ${this._createPongReport(
          !0
        )}`
      ),
      this.wsPongTimeout)
    ) {
      AudioCodesUA.ac_log("AC: keep-alive: Close websocket connection"),
        this._stopWsKeepAlive();
      let e = this.wsSocket;
      (e.onopen = void 0),
        (e.onerror = void 0),
        (e.onclose = void 0),
        (e.onmessage = void 0),
        setTimeout(() => {
          try {
            e.close();
          } catch (e) {
            AudioCodesUA.ac_log("AC: Close websocket error", e);
          }
        }, 0),
        (this.wsWebSocketInterface._ws = null),
        this.wsWebSocketInterface._onClose.call(this.wsWebSocketInterface, {
          wasClean: !1,
          code: 1001,
          reason: "Going Away",
        });
    } else
      AudioCodesUA.ac_log(
        "AC: keep-alive: Warning: websocket is not closed, because pongTimeout=false"
      );
  }
  _sendPing() {
    try {
      let e = Date.now();
      if (null !== this.wsPingTime) {
        let i = e - this.wsNextPingTime;
        this.wsLog >= 3 &&
          AudioCodesUA.ac_log(`AC: keep-alive: timer deviation (ms): ${i}`);
        let s = this.wsPingMs;
        if (
          (Math.abs(i) >= 1e4 &&
            ((this.wsLog > 0 || !this.wsIsThrottling) &&
              (AudioCodesUA.ac_log(
                `AC: keep-alive detected timer throttling: ${Math.round(
                  i / 1e3
                )} seconds ${i > 0 ? "later" : "earlier"}`
              ),
              0 === this.wsLog &&
                AudioCodesUA.ac_log(
                  "AC: keep-alive: The next timer throttling will not be shown in the logs, because log==0"
                )),
            (this.wsIsThrottling = !0),
            this.wsPingMs < this.wsThrottlingPingMs &&
              ((this.wsPingMs = this.wsThrottlingPingMs),
              AudioCodesUA.ac_log(
                `AC: keep-alive: ping interval increased ${this._pingLog()}`
              ))),
          null !== this.wsPongSupported ||
            this.wsPongReceived ||
            (AudioCodesUA.ac_log(
              "AC: keep-alive: Server does not support CRLF pong."
            ),
            (this.wsPongSupported = !1)),
          this.wsPongSupported &&
            !this.wsPongReceived &&
            null === this.wsPongTimeoutTime)
        ) {
          if ((this._onPongTimeout(s), this.wsPongTimeout)) return;
          this.wsPongTimeoutTime = this.wsPingTime;
        }
      }
      (this.wsPingTime = e),
        (this.wsNextPingTime = this.wsPingTime + this.wsPingMs),
        (this.wsPongReceived = !1),
        this.wsSocket.readyState === WebSocket.OPEN
          ? (this.wsIsPingDebugLog && AudioCodesUA.ac_log("AC: send ping"),
            this.wsSocket.send("\r\n\r\n"))
          : AudioCodesUA.ac_log(
              `AC: keep-alive: Warning: Cannot send Ping, websocket state=${this.wsSocket.readyState}`
            ),
        (this.wsPingJob = setTimeout(this._sendPing.bind(this), this.wsPingMs)),
        this.wsPongReport > 0 &&
          this.wsPongReportCounter >= this.wsPongReport &&
          ((this.wsPongReportCounter = 0),
          AudioCodesUA.ac_log(
            `AC: keep-alive: Pong statistics: ${this._createPongReport(
              this.wsPongDist
            )}`
          ));
    } catch (e) {
      AudioCodesUA.ac_log("AC: keep-alive: send ping error", e);
    }
  }
  _startWsKeepAlive() {
    let e = this.jssipUA._transport;
    (this.wsWebSocketInterface = e.socket),
      (this.wsSocket = this.wsWebSocketInterface._ws),
      0 !== this.wsPingMs &&
        ((this.wsOnMessage = this.wsSocket.onmessage),
        (this.wsSocket.onmessage = this._onMessageHook.bind(this)),
        this._stopWsKeepAlive(),
        (this.wsPingTime = null),
        (this.wsPingStarted = !0),
        (this.wsPongSupported = null),
        (this.wsPingJob = setTimeout(
          this._sendPing.bind(this),
          this.wsPingMs
        )));
  }
  _stopWsKeepAlive() {
    (this.wsPingStarted = !1),
      null !== this.wsPingJob &&
        (clearTimeout(this.wsPingJob), (this.wsPingJob = null));
  }
  _createPongReport(e) {
    let i,
      s = "",
      t = !1,
      o = 1e6,
      n = 0;
    e && (i = new Array((this.wsPingMs / 1e3) * 4).fill(0));
    let r = 0;
    for (let s = 0; s < this.wsPongDelays.length; s++) {
      let a = this.wsPongDelays[s];
      if (void 0 !== a && (r++, a < o && (o = a), a > n && (n = a), e)) {
        let e = Math.floor(a / 250);
        e >= i.length && ((e = i.length - 1), (t = !0)), i[e]++;
      }
    }
    if (e) {
      s = "\r\npongs distribution (1/4 second step): ";
      for (let e = 0; e < i.length; e++)
        (s += i[e].toString()),
          e !== i.length - 1 && (s += (e + 1) % 4 == 0 ? "," : " ");
      t && (s += " (+)");
    }
    return `pongs=${r} delay=${o}..${n} ms${s}`;
  }
  setPingDebugLog(e) {
    this.wsIsPingDebugLog = e;
  }
  _setUACallbacks() {
    this.jssipUA.on("connected", () => {
      AudioCodesUA.ac_log('AC>>: loginStateChanged: isLogin=false "connected"'),
        this._startWsKeepAlive(),
        this.listeners.loginStateChanged(!1, "connected", null);
    }),
      this.jssipUA.on("disconnected", () => {
        this._stopWsKeepAlive(),
          AudioCodesUA.ac_log(
            'AC>>: loginStateChanged: isLogin=false "disconnected"'
          ),
          this.listeners.loginStateChanged(!1, "disconnected", null);
      }),
      this.jssipUA.on("registered", (e) => {
        AudioCodesUA.ac_log('AC>>: loginStateChanged: isLogin=true "login"'),
          this.listeners.loginStateChanged(!0, "login", e.response);
      }),
      this.jssipUA.on("unregistered", (e) => {
        AudioCodesUA.ac_log('AC>>: loginStateChanged: isLogin=false "logout"'),
          this.listeners.loginStateChanged(!1, "logout", e.response);
      }),
      this.jssipUA.on("registrationFailed", (e) => {
        let i = e.response ? e.response.status_code : 0;
        if (i >= 300 && i < 400) {
          let i = e.response.parseHeader("contact");
          if (i) {
            let e = i.uri,
              s = "wss://" + e.host;
            if (
              (e.port && 443 !== e.port && (s += ":" + e.port.toString()),
              AudioCodesUA.ac_log(`AC: registerRedirect("${s}")`),
              this.jssipUA.registerRedirect(s))
            )
              return;
          } else
            AudioCodesUA.ac_log(
              'AC: 3xx response without "Contact" is ignored'
            );
        } else if (
          i >= 500 &&
          i < 600 &&
          AudioCodesUA.instance.modes.sbc_switch_register5xx_mode &&
          AudioCodesUA.instance.switchSBC(!1)
        )
          return;
        AudioCodesUA.ac_log(
          'AC>>: loginStateChanged: isLogin=false "login failed"'
        ),
          this.listeners.loginStateChanged(
            !1,
            "login failed",
            e.response ? e.response : null
          );
      }),
      this.listeners.incomingMessage &&
        this.jssipUA.on("newMessage", (e) => {
          "remote" === e.originator &&
            (AudioCodesUA.ac_log("AC>>: incomingMessage", e),
            this.listeners.incomingMessage(
              null,
              AudioCodesUA.instance._get_from(e.request),
              AudioCodesUA.instance._get_content_type(e.request),
              e.request.body,
              e.request
            ));
        }),
      this.listeners.incomingNotify &&
        this.jssipUA.on("sipEvent", (e) => {
          AudioCodesUA.ac_log("AC>>: incoming out of dialog NOTIFY", e),
            this.listeners.incomingNotify(
              null,
              e.event ? e.event.event : null,
              AudioCodesUA.instance._get_from(e.request),
              AudioCodesUA.instance._get_content_type(e.request),
              e.request.body,
              e.request
            ) || e.request.reply(481);
        }),
      this.listeners.incomingSubscribe &&
        this.jssipUA.on("newSubscribe", (e) => {
          let i = e.request,
            s = i.parseHeader("event"),
            t = i.getHeaders("accept");
          AudioCodesUA.ac_log("AC>>: incomingSubscribe", i, s.event, t);
          let o = this.listeners.incomingSubscribe(i, s.event, t);
          o > 0 && i.reply(o);
        }),
      this.jssipUA.on("newRTCSession", function (e) {
        AudioCodesUA.ac_log(
          `AC: event ${
            "remote" === e.originator ? "incoming" : "outgoing"
          } "newRTCSession"`,
          e
        );
        let i,
          s = new AudioCodesSession(e.session);
        if (
          (s.js_session.on("sipEvent", function (e) {
            if (!AudioCodesUA.instance.listeners.incomingNotify) return;
            let i = this.data.ac_session;
            AudioCodesUA.ac_log("AC>>: incoming NOTIFY", i, e),
              (e.taken = AudioCodesUA.instance.listeners.incomingNotify(
                i,
                e.event ? e.event.event : null,
                AudioCodesUA.instance._get_from(e.request),
                AudioCodesUA.instance._get_content_type(e.request),
                e.request.body,
                e.request
              ));
          }),
          s.js_session.on("newInfo", function (e) {
            if (!AudioCodesUA.instance.listeners.incomingInfo) return;
            if ("local" === e.originator) return;
            let i = this.data.ac_session;
            AudioCodesUA.ac_log("AC>>: incoming INFO", i, e),
              AudioCodesUA.instance.listeners.incomingInfo(
                i,
                AudioCodesUA.instance._get_from(e.request),
                AudioCodesUA.instance._get_content_type(e.request),
                e.request.body,
                e.request
              );
          }),
          s.js_session.on("replaces", function (e) {
            (AudioCodesUA.instance.replacedCall = this.data.ac_session),
              AudioCodesUA.ac_log(
                "AC>>: incoming INVITE with Replaces. This call will be replaced:",
                this.data.ac_session
              ),
              e.accept();
          }),
          s.js_session.on("sdp", function (e) {
            AudioCodesUA.instance._sdp_checking(this, e);
          }),
          s.js_session.on("connecting", function (e) {
            AudioCodesUA.ac_log("AC>>: connecting");
            let i = AudioCodesUA.instance.codecFilter;
            i &&
              (AudioCodesUA.instance._cf_filter(
                "audio",
                this.data.ac_session,
                i.audio
              ),
              AudioCodesUA.instance._cf_filter(
                "video",
                this.data.ac_session,
                i.video
              ));
          }),
          s.js_session.on("reinvite", function (e) {
            if (!AudioCodesUA.instance.listeners.callIncomingReinvite) return;
            let i = this.data.ac_session;
            AudioCodesUA.ac_log("AC>>: callIncomingReinvite start"),
              AudioCodesUA.instance.listeners.callIncomingReinvite(
                i,
                !0,
                e.request
              ),
              (e.callback = function () {
                AudioCodesUA.ac_log("AC>>: callIncomingIncomingReinvite end"),
                  AudioCodesUA.instance.listeners.callIncomingReinvite(
                    i,
                    !1,
                    null
                  );
              });
          }),
          s.js_session.on("hold", function (e) {
            let i = this.data.ac_session,
              s = "remote" === e.originator;
            AudioCodesUA.ac_log(
              `AC>>: callHoldStateChanged isHold=true isRemote=${s} session:`,
              i
            ),
              AudioCodesUA.instance.listeners.callHoldStateChanged(i, !0, s);
          }),
          s.js_session.on("unhold", function (e) {
            let i = this.data.ac_session,
              s = "remote" === e.originator;
            AudioCodesUA.ac_log(
              `AC>>: callHoldStateChanged isHold=false isRemote=${s} session:`,
              i
            ),
              AudioCodesUA.instance.listeners.callHoldStateChanged(i, !1, s);
          }),
          s.js_session.on("progress", function (e) {
            if ("remote" === e.originator) {
              let i = this.data.ac_session;
              AudioCodesUA.ac_log("AC>>: outgoingCallProgress", i),
                AudioCodesUA.instance.listeners.outgoingCallProgress(
                  i,
                  e.response
                );
            }
          }),
          s.js_session.on("failed", function (e) {
            let i = this.data.ac_session,
              s = null;
            if ("Redirected" === e.cause && e.message && e.message.headers) {
              let i = e.message.parseHeader("Contact");
              i && (s = i.uri.toString());
            }
            AudioCodesUA.ac_log("AC>>: callTerminated (failed)", i, e.cause, s),
              AudioCodesUA.instance.listeners.callTerminated(
                i,
                e.message,
                e.cause,
                s
              );
          }),
          s.js_session.on("accepted", function (e) {
            let i = this.data.ac_session;
            (i.data._accepted = !0),
              "remote" === e.originator && (i.data._ok_response = e.response);
          }),
          "remote" === e.originator &&
            null !== AudioCodesUA.instance.replacedCall &&
            s.js_session.removeAllListeners("confirmed"),
          s.js_session.on("confirmed", function () {
            let e,
              i = this.data.ac_session,
              t = null;
            "_ok_response" in i.data
              ? ((t = i.data._ok_response),
                delete i.data._ok_response,
                (e = "ACK sent"))
              : (e = "ACK received"),
              s.data._video_call_audio_answer_firefox &&
                ((s.data._video_call_audio_answer_firefox = !1),
                AudioCodesUA.ac_log(
                  "AC: [video call/audio answer] Firefox workaround. Send re-INVITE"
                ),
                s.sendReInvite({ showStreams: !0 })),
              AudioCodesUA.ac_log("AC>>: callConfirmed", i, e),
              AudioCodesUA.instance._onActiveCallsChange.call(
                AudioCodesUA.instance,
                1
              ),
              AudioCodesUA.instance.listeners.callConfirmed(i, t, e);
          }),
          s.js_session.on("ended", function (e) {
            let i = this.data.ac_session;
            i.data._screenSharing &&
              i._onEndedScreenSharing.call(i, "call terminated"),
              AudioCodesUA.ac_log("AC>>: callTerminated (ended)", i, e.cause),
              AudioCodesUA.instance._onActiveCallsChange.call(
                AudioCodesUA.instance,
                -1
              ),
              AudioCodesUA.instance.listeners.callTerminated(
                i,
                e.message,
                e.cause
              );
          }),
          s.js_session.on("refer", function (e) {
            if (AudioCodesUA.instance.listeners.transfereeCreatedCall) {
              let i,
                s = this.data.ac_session;
              if (
                (i =
                  !AudioCodesUA.instance.listeners.transfereeRefer ||
                  AudioCodesUA.instance.listeners.transfereeRefer(s, e.request))
              ) {
                let i;
                AudioCodesUA.ac_log("AC>>: incoming REFER accepted"),
                  (i = s.isScreenSharing()
                    ? s.doesScreenSharingReplaceCamera()
                    : s.hasSendVideo());
                let t = AudioCodesUA.instance._callOptions(i, !0);
                e.accept((e) => {
                  e.data._created_by_refer = s;
                }, t);
              } else
                AudioCodesUA.ac_log("AC>>: incoming REFER rejected"),
                  e.reject();
            } else AudioCodesUA.ac_log("AC>>: incoming REFER rejected, because transfereeCreatedCall is not set"), e.reject();
          }),
          s._setEnabledReceiveVideo(AudioCodesUA.instance.enableAddVideo),
          s.js_session.connection
            ? (AudioCodesUA.instance._set_connection_listener(s),
              AudioCodesUA.ac_log(
                'AC: connection exists, set "track" listener'
              ))
            : (AudioCodesUA.ac_log(
                "AC: peer connection does not exist, wait creation"
              ),
              s.js_session.on("peerconnection", () => {
                AudioCodesUA.instance._set_connection_listener(s),
                  AudioCodesUA.ac_log(
                    'AC: [event connection] connection created, set "track" listener'
                  );
              })),
          (i = "remote" === e.originator ? e.request.from : e.request.to),
          (s.data._user = i.uri.user),
          (s.data._host = i.uri.host),
          (s.data._display_name = i.display_name),
          (s.data._create_time = new Date()),
          "remote" === e.originator)
        ) {
          let i,
            t,
            o,
            n = null;
          if (
            (null !== AudioCodesUA.instance.replacedCall &&
              ((n = AudioCodesUA.instance.replacedCall),
              (AudioCodesUA.instance.replacedCall = null)),
            e.request.body)
          ) {
            o = !0;
            let s = new AudioCodesSDP(e.request.body);
            [i, t] = s.getMediaDirection("video", !0);
          } else
            (o = !1),
              (s.data._incoming_invite_without_sdp = !0),
              (i = t = !0),
              AudioCodesUA.ac_log("AC: warning incoming INVITE without SDP");
          s._setVideoState(i, t),
            AudioCodesUA.ac_log(
              `AC>>: incomingCall ${s.hasVideo() ? "video" : "audio"} from "${
                s.data._display_name
              }" ${s.data._user}`,
              s,
              n
            ),
            AudioCodesUA.instance.listeners.incomingCall(s, e.request, n, o);
        } else s.js_session.data._created_by_refer ? (AudioCodesUA.ac_log("AC>>: outgoing call created by REFER"), (s.data._created_by_refer = s.js_session.data._created_by_refer), AudioCodesUA.instance.listeners.transfereeCreatedCall(s)) : AudioCodesUA.ac_log("AC>>: outgoing call created by phone.call()");
      });
  }
  _get_from(e) {
    return {
      user: e.from.uri.user,
      host: e.from.uri.host,
      displayName: e.from.display_name ? e.from.display_name : null,
    };
  }
  _get_content_type(e) {
    let i = e.headers["Content-Type"];
    return i && i.length > 0 ? i[0].parsed : null;
  }
  _set_connection_listener(e) {
    AudioCodesUA.instance
      .getWR()
      .connection.addEventListener(e.js_session.connection, "track", (i) => {
        if (
          (AudioCodesUA.ac_log(`AC>>: "track" event kind= ${i.track.kind}`, i),
          i.streams.length > 0)
        ) {
          let s = i.streams[0];
          AudioCodesUA.ac_log(`AC: set call remote stream id=${s.id}`, e),
            (e.data._remoteMediaStream = s);
        } else AudioCodesUA.ac_log('AC: Warning "track" event without stream');
        if ("video" === i.track.kind) {
          if (!e.hasEnabledReceiveVideo()) {
            e.data._video_call_audio_answer_safari &&
              ((i.track.onmute = () => {
                AudioCodesUA.ac_log(
                  'AC: [video call/audio answer] Safari fix. Fired video track "mute" event.  Call callShowStream'
                ),
                  (i.track.onmute = null);
                let s = e.getRTCLocalStream(),
                  t = e.getRTCRemoteStream();
                AudioCodesUA.ac_log("AC>>: callShowStreams", e, s, t),
                  AudioCodesUA.instance.listeners.callShowStreams(e, s, t);
              }),
              AudioCodesUA.ac_log(
                'AC: [video call/audio answer] Safari fix. Set video track "mute" event listener'
              ),
              (e.data._video_call_audio_answer_safari = !1)),
              AudioCodesUA.ac_log(
                'AC>>: event "track" video and !hasEnabledReceiveVideo therefore change transceiver direction.',
                e
              );
            let s = AudioCodesUA.instance
              .getWR()
              .connection.getTransceiver(e.js_session.connection, "video");
            if (null !== s) {
              let i = e.hasEnabledSendVideo() ? "sendonly" : "inactive";
              AudioCodesUA.instance.getWR().transceiver.setDirection(s, i);
            }
          }
          return void (
            AudioCodesUA.instance.codecFilter &&
            AudioCodesUA.instance._cf_filter(
              "video",
              e,
              AudioCodesUA.instance.codecFilter.video
            )
          );
        }
        let s = e.getRTCLocalStream(),
          t = e.getRTCRemoteStream();
        AudioCodesUA.ac_log("AC>>: callShowStreams", e, s, t),
          AudioCodesUA.instance.listeners.callShowStreams(e, s, t);
      });
  }
  _check_remote_sdp(e, i) {
    try {
      i.codec_map || (i.codec_map = {});
      let s = e.getMedia("audio");
      AudioCodesUA.instance._check_remote_m(s, i.codec_map);
      let t = e.getMedia("video");
      t && AudioCodesUA.instance._check_remote_m(t, i.codec_map);
    } catch (e) {
      AudioCodesUA.ac_log("AC:SDP exception", e);
    }
  }
  _check_remote_m(e, i) {
    let s = {};
    function t(e, i) {
      let s = i.indexOf(" ", e);
      return -1 === s
        ? ["?", "?"]
        : [i.substring(e, s), i.substring(s + 1).toLowerCase()];
    }
    for (let i of e)
      if (i.startsWith("a=rtpmap:")) {
        let [e, o] = t(9, i);
        s[e] || (s[e] = {}), (s[e].rtpmap = o);
      } else if (i.startsWith("a=fmtp:")) {
        let [e, o] = t(7, i);
        s[e] || (s[e] = {}), (s[e].fmtp = o);
      }
    for (let e of Object.keys(s))
      if (i[e])
        s[e].rtpmap === i[e].rtpmap
          ? s[e].fmtp !== i[e].fmtp &&
            AudioCodesUA.ac_log(
              `AC:SDP [The same payload type and codec name, different fmtp] pt=${e} rtpmap=${s[e].rtpmap} fmtp=${s[e].fmtp}, previously was fmtp=${i[e].fmtp}`
            )
          : (parseInt(e) >= 64 || (s[e].rtpmap && i[e].rtpmap)) &&
            AudioCodesUA.ac_log(
              `AC:SDP [The same payload type, different codec names] pt=${e} rtpmap=${s[e].rtpmap}, previously was rtpmap=${i[e].rtpmap}`
            );
      else {
        let t,
          o = s[e];
        for (let [e, s] of Object.entries(i))
          if (o.rtpmap === s.rtpmap && o.fmtp === s.fmtp) {
            t = e;
            break;
          }
        if (t) {
          let s = i[t];
          o.fmtp || s.fmtp
            ? AudioCodesUA.ac_log(
                `AC:SDP [The same codec name used with different payload types] pt=${e} rtpmap=${o.rtpmap} fmtp=${o.fmtp}, previously was pt=${t} rtpmap=${s.rtpmap} fmtp=${s.fmtp}`
              )
            : AudioCodesUA.ac_log(
                `AC:SDP [The same codec name used with different payload types] pt=${e} rtpmap=${o.rtpmap}, previously was pt=${t} rtpmap=${s.rtpmap}`
              );
        } else i[e] = o;
      }
  }
  _sdp_checking(e, i) {
    let s,
      t,
      o,
      n = i.originator + " " + i.type,
      r = e.data.ac_session;
    try {
      (s = new AudioCodesSDP(i.sdp)),
        ([t, o] = s.getMediaDirection("video", "remote" === i.originator));
    } catch (i) {
      return void AudioCodesUA.ac_log("AC: cannot parse SDP", i);
    }
    let a = r.data._initial;
    switch (
      ("answer" === i.type && (r.data._initial = !1),
      AudioCodesUA.ac_log(
        `AC: Event "sdp" ${
          a ? "initial" : ""
        } ${n}   Session state:${AudioCodesUA.getSessionStatusName(e._status)}`
      ),
      n)
    ) {
      case "remote offer":
        AudioCodesUA.instance.modes.check_remote_sdp_mode &&
          AudioCodesUA.instance._check_remote_sdp(s, e.data);
        break;
      case "remote answer":
        if (
          (AudioCodesUA.instance.modes.check_remote_sdp_mode &&
            AudioCodesUA.instance._check_remote_sdp(s, e.data),
          r.isLocalHold() || r.isRemoteHold())
        )
          break;
        r._setVideoState(t, o);
        break;
      case "local offer":
        AudioCodesUA.instance.networkPriority &&
          AudioCodesUA.instance._set_senders_dscp(e);
        break;
      case "local answer":
        if (r.isLocalHold() || r.isRemoteHold()) break;
        AudioCodesUA.instance.networkPriority &&
          AudioCodesUA.instance._set_senders_dscp(e),
          r._setVideoState(t, o);
    }
  }
  _set_senders_dscp(e) {
    if ("chrome" !== AudioCodesUA.instance.browser) return;
    AudioCodesUA.ac_log("AC: _set_senders_dscp()");
    let i = AudioCodesUA.instance.networkPriority;
    AudioCodesUA.instance._set_dscp(e, "audio", i),
      AudioCodesUA.instance._set_dscp(e, "video", i);
  }
  _set_dscp(e, i, s) {
    let t = e.connection,
      o = AudioCodesUA.instance.getWR().connection.getTransceiver(t, i);
    return o || "video" !== i
      ? Promise.resolve()
          .then(() => {
            let e = o.sender.getParameters();
            if (!e) throw new Error("sender getParameters() returns undefined");
            let t = e.encodings;
            if (!t) throw new Error("parameters encodings is undefined");
            if (0 === t.length)
              throw new Error("parameters encodings is empty array");
            let n = t[0].networkPriority;
            if (!n)
              throw new Error(
                "parameters encodings networkPriority is undefined"
              );
            return (
              n === s ||
              ((t[0].networkPriority = s),
              o.sender
                .setParameters(e)
                .then(() => (AudioCodesUA.ac_log(`AC: DSCP: ${i} "${s}"`), !0)))
            );
          })
          .catch((e) => (AudioCodesUA.ac_log(`AC: DSCP: ${i} error: ${e}`), !1))
      : Promise.resolve(!1);
  }
  _cf_unpack(e) {
    function i(e, i) {
      let s,
        t = i.indexOf("/"),
        o = i.indexOf("#");
      s = -1 !== t ? t : -1 !== o ? o : void 0;
      let n = { mimeType: (e + "/" + i.substring(0, s)).toLowerCase() };
      return (
        -1 !== t &&
          ((s = -1 !== o ? o : void 0),
          (n.clockRate = parseInt(i.substring(t + 1, s)))),
        -1 !== o && (n.sdpFmtpLine = i.substring(o + 1)),
        n
      );
    }
    if (!e) return null;
    let s = {};
    for (let t in e) {
      s[t] = {};
      for (let o in e[t]) s[t][o] = e[t][o].map((e) => i(t, e));
    }
    return s;
  }
  _cf_pack(e) {
    return e.map((e) =>
      (function (e) {
        let i = e.mimeType.substring(6).toLowerCase();
        return (
          e.clockRate && (i += "/" + e.clockRate),
          e.sdpFmtpLine && (i += "#" + e.sdpFmtpLine),
          i
        );
      })(e)
    );
  }
  _cf_str(e) {
    return JSON.stringify(AudioCodesUA.instance._cf_pack(e));
  }
  _cf_match(e, i) {
    let s = e.mimeType.toLowerCase();
    for (let t of i)
      if (t.mimeType === s) {
        if (t.clockRate && t.clockRate !== e.clockRate) continue;
        if (t.sdpFmtpLine && t.sdpFmtpLine !== e.sdpFmtpLine) continue;
        return !0;
      }
    return !1;
  }
  _cf_find(e, i) {
    let s = [];
    for (let t of i) {
      let i = t.mimeType.toLowerCase();
      if (e.mimeType === i) {
        if (e.clockRate && e.clockRate !== t.clockRate) continue;
        if (e.sdpFmtpLine && e.sdpFmtpLine !== t.sdpFmtpLine) continue;
        s.push(t);
      }
    }
    return s;
  }
  _cf_filter(e, i, s) {
    if (s && !i.data[`_used_${e}_codec_filter`])
      try {
        let t = i.getRTCPeerConnection(),
          o = AudioCodesUA.instance.getWR().connection.getTransceiver(t, e);
        if (!o)
          return void (
            "audio" === e &&
            AudioCodesUA.ac_log(
              "AC: codec-filter: cannot get audio transceiver"
            )
          );
        if (
          ((i.data[`_used_${e}_codec_filter`] = !0),
          !RTCRtpSender.getCapabilities ||
            !RTCRtpReceiver.getCapabilities ||
            !o.setCodecPreferences)
        )
          return void AudioCodesUA.ac_log("AC: codec-filter is not supported.");
        let n = RTCRtpSender.getCapabilities(e).codecs,
          r = RTCRtpReceiver.getCapabilities(e).codecs,
          a = [];
        for (let e of r) {
          -1 ===
            n.findIndex(
              (i) =>
                e.mimeType === i.mimeType &&
                e.clockRate === i.clockRate &&
                e.sdpFmtpLine === i.sdpFmtpLine
            ) && a.push(e);
        }
        let d = n.concat(a);
        if (
          (AudioCodesUA.ac_log(
            `AC: ${e} codec-filter original: ${AudioCodesUA.instance._cf_str(
              d
            )}\n(receiver: ${a.length})`
          ),
          s.remove && s.remove.length > 0)
        ) {
          let i = d.length;
          (d = d.filter((e) => !AudioCodesUA.instance._cf_match(e, s.remove)))
            .length < i &&
            AudioCodesUA.ac_log(
              `AC: ${e} codec-filter remaining: ${AudioCodesUA.instance._cf_str(
                d
              )}`
            );
        }
        if (s.priority && s.priority.length > 0) {
          let i = [];
          for (let e of s.priority) {
            let s = AudioCodesUA.instance._cf_find(e, d);
            0 !== s.length &&
              ((i = i.concat(s)), (d = d.filter((e) => !s.includes(e))));
          }
          (d = i.concat(d)),
            AudioCodesUA.ac_log(
              `AC: ${e} codec-filter changed priority: ${AudioCodesUA.instance._cf_str(
                d
              )}`
            );
        }
        return void o.setCodecPreferences(d);
      } catch (e) {
        return void AudioCodesUA.ac_log("AC: codec filter exception", e);
      }
  }
  _convertIceList(e) {
    let i = [];
    for (let s of e)
      "string" == typeof s && (s = { urls: "stun:" + s }), i.push(s);
    return i;
  }
  _randomToken(e) {
    let i = "";
    for (let s = 0; s < e; s++)
      i += Math.floor(36 * Math.random()).toString(36);
    return i;
  }
  _detectBrowser() {
    if (typeof document === undefined) {
      (this.browser = "other"),
      (this.browserName = "unknown"),
      (this.browserVersion = 0);

      return;
    }

    try {
      let e = navigator.userAgent;
      if (
        ((this.browser = "other"),
        (this.browserName = e),
        (this.browserVersion = 0),
        navigator.mozGetUserMedia)
      )
        (this.browser = "firefox"),
          (this.browserName = e.match(/Firefox\/([.\d]+)$/)[0]),
          (this.browserVersion = parseInt(e.match(/Firefox\/(\d+)\./)[1], 10));
      else if (navigator.webkitGetUserMedia) {
        (this.browser = "chrome"),
          (this.browserName = e.match(/Chrom(e|ium)\/([\d]+)/)[0]),
          (this.browserVersion = parseInt(
            e.match(/Chrom(e|ium)\/(\d+)\./)[2],
            10
          ));
        let i = e.toLowerCase();
        for (let e = 0; e < this.chromiumBased.length; e++) {
          let s = this.chromiumBased[e].s,
            t = i.indexOf(s);
          if (-1 !== t) {
            let o = i.substring(t + s.length).match(/([.\d]+)/)[1];
            this.browserName += " (" + this.chromiumBased[e].n + "/" + o + ")";
            break;
          }
        }
      } else
        window.safari
          ? ((this.browser = "safari"),
            (this.browserName = "Safari/" + e.match(/Version\/([.\d]+)/)[1]),
            (this.browserVersion = parseInt(
              e.match(/Version\/(\d+)\./)[1],
              10
            )))
          : -1 !== e.indexOf("Edge/") &&
            ((this.browser = "other"),
            (this.browserName = e.match(/Edge\/([.\d]+)/)[0]),
            (this.browserVersion = parseInt(
              e.match(/Edge\/(\d+).(\d+)$/)[2],
              10
            )));
      /iPad|iPhone|iPod/.test(e) &&
        ((this.browserName = e),
        e.includes("CriOS")
          ? ((this.browser = "chrome"),
            (this.browserVersion = parseInt(e.match(/CriOS\/(\d+)\./)[1], 10)))
          : e.includes("FxiOS")
          ? ((this.browser = "firefox"),
            (this.browserVersion = parseInt(e.match(/FxiOS\/(\d+)\./)[1], 10)))
          : ((this.browser = "safari"),
            (this.browserVersion = parseInt(
              e.match(/Version\/(\d+)\./)[1],
              10
            ))));
    } catch (e) {
      AudioCodesUA.ac_log("AC: Browser detection error", e),
        (this.browser = "other"),
        (this.browserName = navigator.userAgent),
        (this.browserVersion = 0);
    }
  }
  _detectOS() {
    this._detectOS1(), "other" === this.os && this._detectOS2();
  }
  _detectOS1() {
    try {
      let e = !!navigator.userAgentData && navigator.userAgentData.platform;
      if (!e) return;
      ("windows" !== (e = e.toLowerCase()) &&
        "linux" !== e &&
        "android" !== e &&
        "macos" !== e) ||
        (this.os = e);
    } catch (e) {
      AudioCodesUA.ac_log("AC: detectOS1 error", e), (this.os = "other");
    }
  }
  _detectOS2() {
    try {
      let e = navigator.platform;
      if (!e) return;
      (e = e.toLowerCase()).startsWith("win")
        ? (this.os = "windows")
        : e.startsWith("android")
        ? (this.os = "android")
        : e.startsWith("linux")
        ? navigator.userAgent.includes("Android")
          ? (this.os = "android")
          : (this.os = "linux")
        : e.startsWith("mac")
        ? (this.os = "macos")
        : /ipad|iphone|ipod/.test(e) && (this.os = "ios");
    } catch (e) {
      AudioCodesUA.ac_log("AC: detectOS2 error", e), (this.os = "other");
    }
  }
  _mediaConstraints(e) {
    let i = AudioCodesUA.instance,
      s = { audio: i.constraints.audio };
    return e && (s.video = i.constraints.video), s;
  }
  _callOptions(e, i, s = null, t = null) {
    let o = {},
      n = AudioCodesUA.instance;
    return (
      "chrome" === n.browser &&
        n.networkPriority &&
        (o = { rtcConstraints: { optional: [{ googDscp: !0 }] } }),
      null !== t && Object.assign(o, t),
      void 0 === o.pcConfig && (o.pcConfig = {}),
      (o.pcConfig.iceServers = n.serverConfig.iceServers),
      null !== s && (s = s.slice()),
      null !== n.oauthToken &&
        n.oauthTokenUseInInvite &&
        i &&
        (null === s && (s = []),
        s.push("Authorization: Bearer " + n.oauthToken)),
      null !== s && (o.extraHeaders = s),
      o
    );
  }
  call(e, i, s = null, t = null) {
    if (
      (!1 === e
        ? (e = AudioCodesUA.instance.AUDIO)
        : !0 === e && (e = AudioCodesUA.instance.VIDEO),
      "symbol" != typeof e ||
        ![AudioCodesUA.instance.AUDIO, AudioCodesUA.instance.VIDEO].includes(e))
    )
      throw new TypeError(`Illegal videoOption=${e.toString()}`);
    (i = i.replace(/\s+/g, "")),
      AudioCodesUA.ac_log(`AC: call ${e.description} to ${i}`);
    let o = this._callOptions(e === AudioCodesUA.instance.VIDEO, !0, s, t),
      n = this.jssipUA.call(i, o);
    o.mediaStream && (n._localMediaStreamLocallyGenerated = !0);
    let r = n.data.ac_session;
    return (
      r._setEnabledSendVideo(e === AudioCodesUA.instance.VIDEO),
      e === AudioCodesUA.instance.VIDEO && r._setEnabledReceiveVideo(!0),
      r
    );
  }
  sendMessage(e, i, s = "text/plain") {
    return (
      AudioCodesUA.ac_log(`AC: sendMessage to: ${e} "${i}"`),
      new Promise((t, o) => {
        let n = {
          contentType: s,
          eventHandlers: { succeeded: (e) => t(e), failed: (e) => o(e) },
        };
        this.jssipUA.sendMessage(e, i, n);
      })
    );
  }
  isScreenSharingSupported() {
    return AudioCodesUA.instance.getWR().hasDisplayMedia();
  }
  openScreenSharing() {
    return this.isScreenSharingSupported()
      ? (AudioCodesUA.ac_log("AC: openScreenSharing()"),
        AudioCodesUA.instance
          .getWR()
          .getDisplayMedia()
          .then((e) => e)
          .catch((e) => {
            throw (AudioCodesUA.ac_log("AC: openScreenSharing() error", e), e);
          }))
      : (AudioCodesUA.ac_log(
          "AC: openScreenSharing: screen sharing is not supported in the browser"
        ),
        Promise.reject("Screen sharing is not supported"));
  }
  closeScreenSharing(e) {
    if ((AudioCodesUA.ac_log("AC: closeScreenSharing()"), e)) {
      let i = e.getVideoTracks();
      if (0 == i.length) return;
      let s = i[0];
      "live" === s.readyState &&
        (s.stop(), s.dispatchEvent(new Event("ended")));
    }
  }
  setNetworkPriority(e) {
    if (
      (AudioCodesUA.ac_log(`AC: setNetworkPriority ${e}`),
      void 0 !== e &&
        "high" !== e &&
        "medium" !== e &&
        "low" !== e &&
        "very-low" !== e)
    )
      throw new TypeError(`setNetworkPriority: illegal value: ${e}`);
    this.networkPriority = e;
  }
  setNoAnswerTimeout(e) {
    AudioCodesUA.ac_log(`AC: setNoAnswerTimeout ${e}`),
      (this.noAnswerTimeout = e);
  }
  subscribe(...e) {
    return this.jssipUA.subscribe(...e);
  }
  notify(...e) {
    return this.jssipUA.notify(...e);
  }
  addCredential(e) {
    if (!e.realm || !e.password || !e.username)
      throw new TypeError("wrong credential structure");
    this.credentials.push(e);
  }
}
class AudioCodesSession {
  constructor(e) {
    (this.js_session = e),
      (this.data = {
        _user: null,
        _display_name: null,
        _create_time: null,
        _initial: !0,
        _remoteMediaStream: null,
        _wasUsedSendVideo: !1,
        _screenSharing: null,
        _video: { send: !1, receive: !1, enabledSend: !1, enabledReceive: !1 },
      }),
      (e.data.ac_session = this);
  }
  getRTCPeerConnection() {
    return this.js_session.connection;
  }
  getRTCLocalStream() {
    return this.js_session._localMediaStream;
  }
  getRTCRemoteStream() {
    return this.data._remoteMediaStream;
  }
  isEstablished() {
    return this.js_session.isEstablished();
  }
  isTerminated() {
    return this.js_session.isEnded();
  }
  isOutgoing() {
    return "outgoing" === this.js_session.direction;
  }
  isAudioMuted() {
    return this.js_session.isMuted().audio;
  }
  isVideoMuted() {
    return this.js_session.isMuted().video;
  }
  wasAccepted() {
    return !0 === this.data._accepted;
  }
  getReplacesHeader() {
    if (!this.js_session.isEstablished() || !this.js_session._dialog)
      return (
        AudioCodesUA.ac_log("getReplacesHeader(): call is not established"),
        null
      );
    let e = this.js_session._dialog.id;
    return `${e.call_id};to-tag=${e.remote_tag};from-tag=${e.local_tag}`;
  }
  muteAudio(e) {
    AudioCodesUA.ac_log(`AC: muteAudio() arg=${e} `),
      e
        ? this.js_session.mute({ audio: !0, video: !1 })
        : this.js_session.unmute({ audio: !0, video: !1 });
  }
  muteVideo(e) {
    AudioCodesUA.ac_log(`AC: muteVideo() arg=${e} `),
      e
        ? this.js_session.mute({ audio: !1, video: !0 })
        : this.js_session.unmute({ audio: !1, video: !0 });
  }
  sendDTMF(e) {
    let i = AudioCodesUA.instance.dtmfUseWebRTC;
    if (i && "safari" === AudioCodesUA.instance.browser) {
      void 0 ===
        AudioCodesUA.instance
          .getWR()
          .connection.getDTMFSender(this.js_session.connection) && (i = !1);
    }
    AudioCodesUA.ac_log(
      `AC: sendDTMF() tone=${e} ${i ? "[RFC2833]" : "[INFO]"}`
    );
    let s = {
      duration: AudioCodesUA.instance.dtmfDuration,
      interToneGap: AudioCodesUA.instance.dtmfInterToneGap,
      transportType: i ? "RFC2833" : "INFO",
    };
    this.js_session.sendDTMF(e, s);
  }
  sendInfo(e, i, s = null) {
    AudioCodesUA.ac_log("AC: sendInfo()", e, i, s);
    let t = null !== s ? { extraHeaders: s } : void 0;
    this.js_session.sendInfo(i, e, t);
  }
  duration() {
    let e = this.js_session.start_time;
    if (!e) return 0;
    let i = this.js_session.end_time;
    return i || (i = new Date()), Math.floor((i.getTime() - e.getTime()) / 1e3);
  }
  hasSendVideo() {
    return this.data._video.send;
  }
  hasReceiveVideo() {
    return this.data._video.receive;
  }
  hasVideo() {
    return this.hasSendVideo() && this.hasReceiveVideo();
  }
  getVideoState() {
    return this.hasSendVideo() && this.hasReceiveVideo()
      ? "sendrecv"
      : this.hasSendVideo()
      ? "sendonly"
      : this.hasReceiveVideo()
      ? "recvonly"
      : "inactive";
  }
  _setVideoState(e, i) {
    AudioCodesUA.ac_log(`AC: _setVideoState(send=${e}, receive=${i})`),
      (this.data._video.send = e),
      (this.data._video.receive = i);
  }
  hasEnabledSendVideo() {
    return this.data._video.enabledSend;
  }
  hasEnabledReceiveVideo() {
    return this.data._video.enabledReceive;
  }
  getEnabledVideoState() {
    return this.hasEnabledSendVideo() && this.hasEnabledReceiveVideo()
      ? "sendrecv"
      : this.hasEnabledSendVideo()
      ? "sendonly"
      : this.hasEnabledReceiveVideo()
      ? "recvonly"
      : "inactive";
  }
  _setEnabledSendVideo(e) {
    AudioCodesUA.ac_log(`AC: _setEnabledSendVideo(${e})`),
      (this.data._video.enabledSend = e);
  }
  _setEnabledReceiveVideo(e) {
    AudioCodesUA.ac_log(`AC: _setEnabledReceiveVideo(${e})`),
      (this.data._video.enabledReceive = e);
  }
  answer(e, i = null, s = null) {
    if (this.data._answer_called)
      return void AudioCodesUA.ac_log(
        "AC: answer() is already called. [Ignored]"
      );
    if (
      ((this.data._answer_called = !0),
      !1 === e
        ? (e = AudioCodesUA.instance.AUDIO)
        : !0 === e && (e = AudioCodesUA.instance.VIDEO),
      "symbol" != typeof e ||
        ![
          AudioCodesUA.instance.AUDIO,
          AudioCodesUA.instance.RECVONLY_VIDEO,
          AudioCodesUA.instance.VIDEO,
        ].includes(e))
    )
      throw new TypeError(`Illegal videoOption=${e.toString()}`);
    if (
      (AudioCodesUA.ac_log(`AC: ${e.description} answer`),
      this.hasVideo() ||
        (e !== AudioCodesUA.instance.RECVONLY_VIDEO &&
          e !== AudioCodesUA.instance.VIDEO) ||
        (AudioCodesUA.ac_log(
          'AC: incoming INVITE without video, so answer can be only "audio"'
        ),
        (e = AudioCodesUA.instance.AUDIO)),
      this.hasVideo() && e === AudioCodesUA.instance.AUDIO)
    ) {
      let e = AudioCodesUA.instance,
        i = e.browser,
        s = e.modes,
        t = e.browserVersion;
      "firefox" === i && s.video_call_audio_answer_firefox_fix
        ? (this.data._video_call_audio_answer_firefox = !0)
        : "safari" === i &&
          ((!0 === s.video_call_audio_answer_safari_fix && t < 14) ||
            "force" === s.video_call_audio_answer_safari_fix) &&
          (this.data._video_call_audio_answer_safari = !0);
    }
    switch (e) {
      case AudioCodesUA.instance.AUDIO:
        this._setEnabledSendVideo(!1),
          this.data._incoming_invite_without_sdp
            ? this._setEnabledReceiveVideo(AudioCodesUA.instance.enableAddVideo)
            : this._setEnabledReceiveVideo(
                !this.hasVideo() && AudioCodesUA.instance.enableAddVideo
              ),
          this._setVideoState(!1, !1);
        break;
      case AudioCodesUA.instance.VIDEO:
        this._setEnabledSendVideo(!0),
          this._setEnabledReceiveVideo(!0),
          this._setVideoState(!0, !0);
        break;
      case AudioCodesUA.instance.RECVONLY_VIDEO:
        this._setEnabledSendVideo(!1),
          this._setEnabledReceiveVideo(!0),
          this._setVideoState(!1, !0);
    }
    let t = AudioCodesUA.instance._callOptions(
      e === AudioCodesUA.instance.VIDEO,
      !1,
      i,
      s
    );
    Promise.resolve()
      .then(() =>
        t.mediaStream
          ? t.mediaStream
          : AudioCodesUA.instance.getWR().getUserMedia(t.mediaConstraints)
      )
      .then((e) => {
        (t.mediaStream = e),
          (this.js_session._localMediaStreamLocallyGenerated = !0),
          AudioCodesUA.ac_log("AC: answer options:", t),
          this.js_session.answer(t);
      })
      .catch((e) => {
        AudioCodesUA.ac_log("AC: getUserMedia failure", e), this.reject(488);
      });
  }
  reject(e = 486, i = null) {
    AudioCodesUA.ac_log("AC: reject()");
    try {
      let s = { status_code: e };
      i && (s.extraHeaders = i), this.js_session.terminate(s);
    } catch (e) {
      AudioCodesUA.ac_log("AC: call reject error:", e);
    }
  }
  terminate() {
    AudioCodesUA.ac_log("AC: terminate()");
    try {
      this.js_session.terminate();
    } catch (e) {
      AudioCodesUA.ac_log("AC: call terminate error:", e);
    }
  }
  redirect(e, i = 302, s = null) {
    AudioCodesUA.ac_log(`AC: redirect() callTo=${e}`);
    try {
      let t = {
        status_code: i,
        extraHeaders: [
          "Contact: " + AudioCodesUA.instance.jssipUA.normalizeTarget(e),
        ],
      };
      s && t.extraHeaders.push(...s), this.js_session.terminate(t);
    } catch (e) {
      AudioCodesUA.ac_log("AC: call redirect error:", e);
    }
  }
  isLocalHold() {
    return this.js_session.isOnHold().local;
  }
  isRemoteHold() {
    return this.js_session.isOnHold().remote;
  }
  isReadyToReOffer() {
    return this.js_session._isReadyToReOffer();
  }
  hold(e) {
    return (
      AudioCodesUA.ac_log(`AC: hold(${e})`),
      new Promise((i, s) => {
        (e ? this.js_session.hold : this.js_session.unhold).call(
          this.js_session,
          {},
          () => {
            AudioCodesUA.ac_log("AC: hold()/unhold() is completed"), i();
          }
        ) || (AudioCodesUA.ac_log("AC: hold()/unhold() failed"), s());
      })
    );
  }
  enableReceiveVideo(e) {
    this._setEnabledReceiveVideo(e);
    let i = this.getRTCPeerConnection(),
      s = AudioCodesUA.instance.getWR().connection.getTransceiver(i, "video");
    if (null !== s) {
      let e = this.getEnabledVideoState();
      AudioCodesUA.instance.getWR().transceiver.setDirection(s, e);
    }
    return (
      AudioCodesUA.ac_log(
        `AC: enableReceiveVideo(${e}) ${
          null !== s ? "" : "No video transceiver"
        }`
      ),
      null !== s
    );
  }
  startSendingVideo(e = {}) {
    let i = e && !1 !== e.enabledReceiveVideo;
    return this.hasEnabledSendVideo()
      ? (AudioCodesUA.ac_log("AC: startSendingVideo(). Already started"),
        Promise.reject("video already started"))
      : (AudioCodesUA.ac_log("AC: startSendingVideo()"),
        AudioCodesUA.instance
          .getWR()
          .getUserMedia({ video: AudioCodesUA.instance.constraints.video })
          .catch((e) => {
            throw (
              (AudioCodesUA.ac_log(
                "AC: startSendingVideo() getUserMedia failure",
                e
              ),
              e)
            );
          })
          .then((e) => {
            let s = e.getVideoTracks()[0];
            this.getRTCLocalStream().addTrack(s),
              this._setEnabledSendVideo(!0),
              this._setEnabledReceiveVideo(i);
            let t = this.data._wasUsedSendVideo;
            return AudioCodesUA.instance
              .getWR()
              .connection.addVideo(
                this.getRTCPeerConnection(),
                this.getRTCLocalStream(),
                s,
                this.hasEnabledReceiveVideo(),
                t
              )
              .then(() => {
                !t &&
                  AudioCodesUA.instance.codecFilter &&
                  AudioCodesUA.instance._cf_filter(
                    "video",
                    this,
                    AudioCodesUA.instance.codecFilter.video
                  );
              })
              .catch((e) => {
                throw (
                  (AudioCodesUA.ac_log(
                    "AC: startSendingVideo(). Adding video error",
                    e
                  ),
                  e)
                );
              });
          })
          .then(() => this._renegotiate(e)));
  }
  stopSendingVideo(e = {}) {
    return this.hasEnabledSendVideo()
      ? (AudioCodesUA.ac_log("AC: stopSendingVideo()"),
        AudioCodesUA.instance
          .getWR()
          .connection.removeVideo(
            this.getRTCPeerConnection(),
            this.getRTCLocalStream()
          )
          .catch((e) => {
            throw (
              (AudioCodesUA.ac_log(
                "AC: stopSendingVideo(). Remove video error",
                e
              ),
              e)
            );
          })
          .then(
            () => (
              this._setEnabledSendVideo(!1),
              (this.data._wasUsedSendVideo = !0),
              this._renegotiate(e)
            )
          ))
      : (AudioCodesUA.ac_log("AC: stopSendingVideo(). Already stopped"),
        Promise.reject("video already stopped"));
  }
  _doRenegotiate(e) {
    return this.js_session.isEnded()
      ? Promise.reject("call is ended")
      : new Promise((i) => {
          if (!this.js_session.renegotiate(e, () => i(!0))) return i(!1);
        });
  }
  _renegotiate(e, i = 30, s = 500) {
    return (
      AudioCodesUA.ac_log(`AC: _renegotiate() attemptsLeft=${i}`),
      this._doRenegotiate(e)
        .then((t) => {
          if (t) return AudioCodesUA.ac_log("AC: Renegotiation success"), !0;
          if (i <= 1) throw new Error("Too many attempts");
          return new Promise((e) => setTimeout(e, s)).then(() =>
            this._renegotiate(e, i - 1, s)
          );
        })
        .catch((e) => {
          throw (AudioCodesUA.ac_log("AC: Renegotiation failed", e), e);
        })
    );
  }
  sendReInvite(e = {}) {
    return (
      AudioCodesUA.ac_log("AC: sendReInvite()"),
      this._renegotiate(e).then(() => {
        if (e.showStreams) {
          let e = this.getRTCLocalStream(),
            i = this.getRTCRemoteStream();
          AudioCodesUA.ac_log(
            "AC>>: [after send re-INVITE] callShowStreams",
            this,
            e,
            i
          ),
            AudioCodesUA.instance.listeners.callShowStreams(this, e, i);
        }
      })
    );
  }
  startScreenSharing(
    e,
    i = { localScreenSharing: !0, enabledReceiveVideo: !0, separateVideo: !1 }
  ) {
    if ((AudioCodesUA.ac_log("AC: startScreenSharing"), !e))
      return Promise.reject("missed stream argument");
    if (this.data._screenSharing)
      return Promise.reject("the call is already using screen-sharing");
    let s = i && !1 !== i.enabledReceiveVideo,
      t = e.getVideoTracks()[0],
      o = void 0;
    i.localScreenSharing &&
      ((o = this._onEndedScreenSharingTrack.bind(this)),
      t.addEventListener("ended", o)),
      (this.data._screenSharing = {
        stream: e,
        onended: o,
        hadSendVideo: this.hasSendVideo(),
      });
    let n = this.data._wasUsedSendVideo;
    return (
      this._setEnabledSendVideo(!0),
      this._setEnabledReceiveVideo(s),
      AudioCodesUA.instance
        .getWR()
        .connection.addVideo(
          this.getRTCPeerConnection(),
          this.getRTCLocalStream(),
          t,
          this.hasEnabledReceiveVideo(),
          n
        )
        .then(() => {
          !n &&
            AudioCodesUA.instance.codecFilter &&
            AudioCodesUA.instance._cf_filter(
              "video",
              this,
              AudioCodesUA.instance.codecFilter.video
            );
        })
        .catch((e) => {
          throw (
            (AudioCodesUA.ac_log("AC: startScreenSharing() error", e),
            (this.data._screenSharing = null),
            e)
          );
        })
        .then(() => {
          return this._renegotiate({ extraHeaders: ["X-Screen-Sharing: on"] });
        })
    );
  }
  stopScreenSharing() {
    return (
      AudioCodesUA.ac_log("AC: stopScreenSharing"),
      this.data._screenSharing
        ? this._onEndedScreenSharing("called stopScreenSharing()")
        : Promise.reject("the call does not use screen-sharing")
    );
  }
  isScreenSharing() {
    return !!this.data._screenSharing;
  }
  doesScreenSharingReplaceCamera() {
    let e = this.data._screenSharing;
    return e && e.hadSendVideo;
  }
  _onEndedScreenSharingTrack() {
    return this._onEndedScreenSharing("track ended");
  }
  _onEndedScreenSharing(e) {
    let i = this.data._screenSharing;
    this.data._screenSharing = null;
    let s = i.stream,
      t = i.onended;
    if (s && t) {
      s.getVideoTracks()[0].removeEventListener("ended", t);
    }
    return Promise.resolve()
      .then(() => {
        if (!this.isTerminated()) {
          let e = this.getRTCPeerConnection(),
            s = this.getRTCLocalStream(),
            t = { extraHeaders: ["X-Screen-Sharing: off"] };
          return i.hadSendVideo
            ? (AudioCodesUA.ac_log(
                "AC: screen sharing stopped - restore previously sending video track"
              ),
              AudioCodesUA.instance
                .getWR()
                .connection.replaceSenderTrack(e, "video", s),
              this._renegotiate(t))
            : (AudioCodesUA.ac_log(
                "AC: screen sharing stopped - stop send video"
              ),
              this.stopSendingVideo(t));
        }
      })
      .then(() => {
        AudioCodesUA.instance.listeners.callScreenSharingEnded &&
          (AudioCodesUA.ac_log(`AC>>: callScreenSharingEnded "${e}"`, this, s),
          AudioCodesUA.instance.listeners.callScreenSharingEnded(this, s));
      });
  }
  setRemoteHoldState() {
    this.js_session._remoteHold = !0;
  }
  sendRefer(e, i = null) {
    if (!AudioCodesUA.instance.listeners.transferorNotification)
      throw new Error("transferorNotification listener is missed");
    let s = this,
      t = {
        eventHandlers: {
          requestSucceeded() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification progress [REFER accepted]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, 0);
          },
          requestFailed() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification failed [REFER failed]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, -1);
          },
          trying() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification progress [NOTIFY 1xx]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, 0);
          },
          progress() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification progress [NOTIFY 1xx]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, 0);
          },
          accepted() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification success [NOTIFY 2xx]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, 1);
          },
          failed() {
            AudioCodesUA.ac_log(
              "AC>>: transferorNotification failed [NOTIFY >= 300]"
            ),
              AudioCodesUA.instance.listeners.transferorNotification(s, -1);
          },
        },
      };
    null !== i && (t.replaces = i.js_session), this.js_session.refer(e, t);
  }
}
class AudioCodesSDP {
  constructor(e) {
    (this.start = []), (this.media = []);
    let i = e
        .split("\n")
        .map((e) => e.trim())
        .filter((e) => e.length > 0),
      s = this.start;
    for (let e of i)
      e.startsWith("m=") && ((s = []), this.media.push(s)), s.push(e);
  }
  getMedia(e) {
    for (let i of this.media)
      if (i.length > 0 && i[0].startsWith("m=" + e)) return i;
    return null;
  }
  checkSendRecv(e) {
    switch (e) {
      case "a=sendrecv":
        return "sendrecv";
      case "a=sendonly":
        return "sendonly";
      case "a=recvonly":
        return "recvonly";
      case "a=inactive":
        return "inactive";
      default:
        return null;
    }
  }
  getMediaDirectionValue(e) {
    let i,
      s = this.getMedia(e);
    if (null === s) return null;
    let t = "sendrecv";
    for (let e of this.start)
      if (null !== (i = this.checkSendRecv(e))) {
        t = i;
        break;
      }
    for (let e of s)
      if (null !== (i = this.checkSendRecv(e))) {
        t = i;
        break;
      }
    return t;
  }
  getMediaDirection(e, i) {
    let s = this.getMediaDirectionValue(e);
    switch (s) {
      case "sendrecv":
        return [!0, !0, s];
      case "sendonly":
        return i ? [!1, !0, s] : [!0, !1, s];
      case "recvonly":
        return i ? [!0, !1, s] : [!1, !0, s];
      case null:
      case "inactive":
        return [!1, !1, s];
    }
  }
  toString() {
    let e = this.start;
    for (let i of this.media) e = e.concat(i);
    return e.join("\r\n") + "\r\n";
  }
}
let AudioCodesWebRTCWrapper = {
  getUserMedia: (e) => (
    AudioCodesUA.ac_log(
      `[webrtc] getUserMedia constraints=${JSON.stringify(e)}`
    ),
    navigator.mediaDevices.getUserMedia(e)
  ),
  hasDisplayMedia: () =>
    navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia,
  getDisplayMedia: () => (
    AudioCodesUA.ac_log("[webrtc] getDisplayMedia"),
    navigator.mediaDevices.getDisplayMedia({ video: !0 })
  ),
  mediaDevices: {
    enumerateDevices: () =>
      navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
        ? navigator.mediaDevices.enumerateDevices()
        : Promise.reject("WebRTC is not supported"),
    addDeviceChangeListener(e) {
      navigator.mediaDevices &&
        navigator.mediaDevices.addEventListener("devicechange", e);
    },
    removeDeviceChangeListener(e) {
      navigator.mediaDevices &&
        navigator.mediaDevices.removeEventListener("devicechange", e);
    },
  },
  checkAvailableDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
      return Promise.reject("WebRTC is not supported");
    let e = !1,
      i = !1,
      s = !1;
    return navigator.mediaDevices.enumerateDevices().then(
      (t) => (
        t.forEach(function (t) {
          switch (t.kind) {
            case "videoinput":
              e = !0;
              break;
            case "audioinput":
              i = !0;
              break;
            case "audiooutput":
              s = !0;
          }
        }),
        void 0 === navigator.webkitGetUserMedia && (s = !0),
        s
          ? i
            ? Promise.resolve(e)
            : Promise.reject(
                "Missing a microphone! Please connect one and reload"
              )
          : Promise.reject("Missing a speaker! Please connect one and reload")
      )
    );
  },
  transceiver: {
    setDirection(e, i) {
      let s = "";
      null !== e.sender.track
        ? (s = e.sender.track.kind)
        : null !== e.receiver.track && (s = e.receiver.track.kind),
        AudioCodesUA.ac_log(`[webrtc] set ${s} transceiver direction=${i}`),
        (e.direction = i);
    },
  },
  stream: {
    getInfo(e) {
      function i(e) {
        return e.length > 0 ? e[0].enabled.toString() : "-";
      }
      return null === e
        ? Promise.resolve("stream is null")
        : Promise.resolve(
            `audio: ${i(e.getAudioTracks())} video: ${i(e.getVideoTracks())}`
          );
    },
  },
  connection: {
    getTransceiversInfo(e) {
      function i(e) {
        return null === e ? "none" : `d=${e.direction} c=${e.currentDirection}`;
      }
      let s = e.getTransceivers(),
        t = AudioCodesUA.instance.getWR().connection.getTransceiver(e, "audio"),
        o = AudioCodesUA.instance.getWR().connection.getTransceiver(e, "video");
      return Promise.resolve(`(${s.length}) audio ${i(t)} video ${i(o)}`);
    },
    getTransceiver(e, i) {
      for (let s of e.getTransceivers()) {
        if (
          null !== s.sender &&
          null !== s.sender.track &&
          s.sender.track.kind === i
        )
          return s;
        if (
          null !== s.receiver &&
          null !== s.receiver.track &&
          s.receiver.track.kind === i
        )
          return s;
      }
      return null;
    },
    addEventListener: (e, i, s) => (
      AudioCodesUA.ac_log(`[webrtc] Connection addEventListener ${i}`),
      "track" !== i
        ? Promise.reject(`Wrong event name: ${i}`)
        : (e.addEventListener(i, s), Promise.resolve())
    ),
    getDTMFSender(e) {
      let i = e.getSenders().find((e) => e.track && "audio" === e.track.kind);
      if (i && i.dtmf) return i.dtmf;
    },
    addVideo(e, i, s, t, o) {
      AudioCodesUA.ac_log("[webrtc] Connection addVideo");
      let n = AudioCodesUA.instance
        .getWR()
        .connection.getTransceiver(e, "video");
      if (null !== n) {
        let e = t ? "sendrecv" : "sendonly";
        AudioCodesUA.instance.getWR().transceiver.setDirection(n, e);
      }
      return null === n || (null === n.sender.track && !o)
        ? (AudioCodesUA.ac_log("[webrtc] addVideo (connection addTrack)"),
          e.addTrack(s, i),
          Promise.resolve(!0))
        : (AudioCodesUA.ac_log(
            "[webrtc] addVideo (video transceiver sender replaceTrack)"
          ),
          n.sender.replaceTrack(s).then(() => !1));
    },
    removeVideo(e, i) {
      AudioCodesUA.ac_log("[webrtc] Connection removeVideo");
      let s = AudioCodesUA.instance
        .getWR()
        .connection.getTransceiver(e, "video");
      if (null === s) return Promise.reject("no video transceiver found");
      if ((e.removeTrack(s.sender), i))
        for (let e of i.getVideoTracks()) i.removeTrack(e), e.stop();
      return Promise.resolve();
    },
    replaceSenderTrack(e, i, s) {
      AudioCodesUA.ac_log(`[webrtc] ReplaceSenderTrack ${i}`);
      let t = null;
      for (let s of e.getSenders())
        if (null !== s.track && s.track.kind === i) {
          t = s;
          break;
        }
      if (null === t) return Promise.reject(`No ${i} sender`);
      let o = "audio" === i ? s.getAudioTracks() : s.getVideoTracks();
      return 0 === o.length
        ? Promise.reject(`No ${i} track`)
        : t.replaceTrack(o[0]);
    },
    getStats(e, i) {
      let s = "";
      return e.getStats(null).then(
        (e) => (
          e.forEach((e) => {
            if (i.includes(e.type)) {
              s += " {";
              let i = !0;
              for (let t of Object.keys(e))
                i ? (i = !1) : (s += ","), (s += t + "=" + e[t]);
              s += "} \r\n";
            }
          }),
          s
        )
      );
    },
  },
};

module.exports = {
  AudioCodesSession,
  AudioCodesUA,
}