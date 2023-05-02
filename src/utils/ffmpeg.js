import { ffmpeg } from 'js-ffmpeg'

export const ffmpegTr = (url) => {
  ffmpeg.ffprobe(url).success(function (json) {
    console.log(json)
  }).error(function (error) {
    console.log(error)
  })
}
