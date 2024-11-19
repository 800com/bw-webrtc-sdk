import { IncomingMessage, OutgoingRequest, } from 'jssip';
import { RTCSession } from 'jssip/lib/RTCSession';

declare module '@800/bw-webrtc-sdk' {
  interface AudioCodesUAListenersConfig {
    loginStateChanged(isLogin: boolean, cause: 'connected' | 'disconnected' | 'login failed' | 'login' | 'logout'): void
    incomingCall(call: AudioCodesSession, invite: OutgoingRequest, replacedCall: AudioCodesSession | null, hasSDP: boolean): void
    callConfirmed(call: AudioCodesSession, message: IncomingMessage | null, cause: 'ACK received' | 'ACK sent'): void
    outgoingCallProgress(call: AudioCodesSession, response: IncomingMessage): void
    callShowStreams(call: AudioCodesSession, localStream: MediaStream, remoteStream: MediaStream): void
    callTerminated(call: AudioCodesSession, message: IncomingMessage | null, cause: 'Redirected' | 'Rejected' | 'Not Found' | 'Terminated' | 'Busy' | 'Canceled' | 'Expires' | 'RTP Timeout'): void
    callHoldStateChanged(call: AudioCodesSession, isHold: boolean, isRemote: boolean): void
    callIncomingReinvite?(call: AudioCodesSession, start: boolean, request: IncomingMessage): void
    transferorNotification?(call: AudioCodesSession, state: number): void
    transfereeRefer?(call: AudioCodesSession, refer: IncomingMessage): void
    transfereeCreatedCall?(call: AudioCodesSession): void
    incomingNotify?(call: AudioCodesSession, eventName: string, from: unknown, contentType: string, request: IncomingMessage): void
    incomingMessage?(call: AudioCodesSession, from: unknown, contentType: string, body: string, request: IncomingMessage): void
    incomingInfo?(call: AudioCodesSession, from: unknown, contentType: string, body: string, request: IncomingMessage): void
    callScreenSharingEnded?(call: AudioCodesSession, stream: MediaStream): void
    incomingSubscribe?(subscribe: OutgoingRequest, eventName: string, accepts: string[]): void
  }

  export class AudioCodesUA {
    constructor()
    version(): string
    getBrowserName(): string
    /**
     * @param token 
     * @param oauthTokenUseInInvite default is true
     */
    setOAuthToken(token: string, oauthTokenUseInInvite?:boolean): void
    setUserAgent(userAgent: string): void
    setAccount(user: string, displayName: string, password?: string, authUser?: string): void
    checkAvailableDevices(): Promise<void>
    setReconnectIntervals(minInterval: number, maxInterval: number): void
    /**
     * 
     * @param useWebRTC 
     * @param dtmfDuration default 250ms
     * @param dtmfInterToneGap default 250ms
     */
    setDtmfOptions(useWebRTC: boolean, dtmfDuration?: number, dtmfInterToneGap?: number): void
    isInitialized(): boolean
    setServerConfig(addresses: string | string[], domain: string, iceServers?: RTCConfiguration['iceServers']): void
    setListeners(listeners: AudioCodesUAListenersConfig): void
    setJsSipLogger(logger: (message: string) => void): void
    setAcLogger(logger: (message: string) => void): void
    call(useVideo: boolean, recipient: string, extraHeaders?: string[], extraOptions?: Reacord<string, unknown>): { call: AudioCodesSession, rtcSession: RTCSession }
    /**
     * Init caller
     * @param autoLogin default is true
     */
    init(autoLogin?: boolean): Promise<void>
    /**
     * Deinit caller
     */
    deinit(): void
  }

  export class AudioCodesSession {
    answer(useVideo: boolean): void
    terminate(): void
    redirect(target: string): void
    muteAudio(muted: boolean): void
    muteVideo(muted: boolean): void
    isAudioMuted(): boolean
    isVideoMuted(): boolean
    sendDTMF(dtmf: string | number): void
    reject(): void
    getRTCRemoteStream(): MediaStream | null
    isOutgoing(): boolean
    wasAccepted(): boolean
    data: Record<string, unknown>
    duration: number
    isLocalHold(): boolean
    isRemoteHold(): boolean
    isReadyToReOffer(): boolean
    hold(): void
    getRTCPeerConnection(): RTCPeerConnection | null
    getRTCLocalStream(): MediaStream | null
    getRTCRemoteStream(): MediaStream | null
    startSendingVideo(): void
    stopSendingVideo(): void
    hasVideo(): boolean
    hasSendVideo(): boolean
    hasReceiveVideo(): boolean
    setRemoteHoldState(): void
    sendRefer(target: string): void
  }
}
