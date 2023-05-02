// const DEFAULT_ICE_SERVER = {
//   url: 'turn:101.35.44.70:3478',
//   credential: '123456',
//   username: 'demo'
// }
const DEFAULT_ICE_SERVERS = {
  iceServers: [
    { url: 'stun:stun.l.google.com:19302' }, // 谷歌的公共服务
    {
      url: 'turn:101.35.44.70:3478',
      credential: '123456',
      username: 'admin'
    }
  ],
  sdpSemantics: 'plan-b'
}
// var pc_config = {
//   "iceServers": [{
//       url: "stun:ip:端口"
//   }, {
//       url: "turn:ip:端口",
//       credential: "kurento",
//       username: "kurento"
//   }]
// };

export {
  DEFAULT_ICE_SERVERS
}
