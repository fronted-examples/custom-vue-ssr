/* eslint-disable no-unused-vars */
import { createMultipartUpload, completeMultipartUpload, upload } from '@/api/v1/upload'
import SparkMD5 from 'spark-md5'
import { CancelToken } from 'axios'
import { promisePool } from '@/utils/promise-pool'
import { getVideoBasicInfo } from '@/utils/video-saturation'
import store from '@/store/index'

const userId = store.state.user ? store.state.user.userInfo ? store.state.user.userInfo.id : null : null

const CHUNK_SIZE = 5 * 1024 * 1024

const uploadStatus = {
  waiting: {
    'EN': 'waiting',
    'zh-CN': '等待中'
  },
  toStarted: {
    'EN': 'toStarted',
    'zh-CN': '待开始'
  },
  pausing: {
    'EN': 'pausing',
    'zh-CN': '暂停中'
  },
  uploading: {
    'EN': 'uploading',
    'zh-CN': '上传中'
  },
  failed: {
    'EN': 'failed',
    'zh-CN': '上传失败'
  },
  success: {
    'EN': 'success',
    'zh-CN': '上传成功'
  },
  deleted: {
    'EN': 'deleted',
    'zh-CN': '已删除'
  }
}

export let files = []

const accepts = {
  'any': 'MIME_type',
  video: 'video/*',
  audio: 'audio/*',
  image: 'image/*',
  html: 'text/html',
  zip: 'application/zip',
  doc: 'application/msword',
  excel: 'application/vnd.ms-excel'
}

const defaultOptions = {
  // fileAdded: function () {},
  // beforeUpload: function () {},
  // startUpload: function () {},
  // uploading: function () {},
  // uploadFinished: function () {},
  // getVideoImages: function () {},
  files: [],
  simultaneousUploads: 3,
  accept: 'MIME_type',
  autoStart: true,
  cover: true,
  covers_number: 9,
  language: 'zh-CN'
}

/**
 *
 * @param {*} sourceFiles 要上传的文件，可以多个文件
 * @param {*} roomId 业务线id
 * @param {*} beforeUpload 上传前钩子
 * @param {*} startUpload 开始上传钩子
 * @param {*} uploading 上传中钩子
 * @param {*} uploadFinished 完成上传钩子
 */
const addFiles = async (sourceFiles, options) => {
  options = Object.assign(options, defaultOptions)

  for (let sourceFile of sourceFiles) {
    const file = {
      // 文件名
      name: sourceFile.name,
      // 文件类型
      type: sourceFile.type,
      // 是否在添加文件后自动上传, 默认为true
      autoStart: options.autoStart,
      // 如果是视频，是否自动获取对应图片
      cover: options.cover,
      // 并发请求量
      simultaneousUploads: options.simultaneousUploads,
      // 文件md5
      md5: '',
      // 切片列表
      chunks: [],
      // 切片分片上传的uploadId
      uploadId: '',
      // 切片上传Url列表
      chunkUrls: [],
      // 所有待上传的参数队列
      promises: [],
      // 上传进度
      percentage: 0,
      // 已上传大小,换算带单位
      uploaded: '0 bytes',
      // 已上传大小
      uploadedSize: 0,
      // 开始上传时间
      uploadTime: 0,
      // 上传速度
      speed: '0 bytes/s',
      // 切片完成度
      chunkedProgress: 0,
      // 上传剩余时间
      remainingTime: '0 秒',
      // 总数量大小
      fileSizeByte: sourceFile.size,
      // 总大小
      fileSize: formatSize(sourceFile.size),
      // 原始文件
      file: sourceFile,
      // 文件的blobUrl
      blobUrl: '',
      // 上传后的网络url
      url: '',
      // 暂停的请求
      cancels: [],
      // 视频某些帧的图片
      videoImages: [],
      // 视频时长
      duration: 0,
      // 截取视频某些帧的图片的数量
      imgNumber: options.covers_number,
      // 语言
      language: options.language,
      // 文件上传状态
      status: uploadStatus.waiting[options.language],
      // 文件已添加的钩子
      fileAdded: () => {
        file.status = uploadStatus.waiting[file.language]

        if (options.fileAdded) {
          options.fileAdded(file)
        }
      },
      // 开始上传前的钩子
      beforeUpload: () => {
        if (options.beforeUpload) {
          options.beforeUpload(file)
        }
      },
      // 开始上传的钩子
      startUpload: () => {
        if (options.startUpload) {
          options.startUpload(file)
        }
      },
      // 上传中的钩子
      uploading: (index) => {
        if (options.uploading) {
          options.uploading(file, index)
        }
      },
      // 上传结束的钩子
      uploadFinished: (file, isOver) => {
        if (options.uploadFinished) {
          options.uploadFinished(file, isOver)
        }
      },
      // 开始事件,callback是开始后的回调
      start: (callback) => {
        file.status = uploadStatus.uploading[file.language]

        handleUpload(file, sourceFiles, callback)
      },
      // 暂停事件,callback是暂停后的回调
      pause: (callback) => {
        file.status = uploadStatus.pausing[file.language]

        while (file.cancels.length) {
          // data.cancels.pop()('取消请求')
          file.cancels.pop()()
        }

        if (callback) {
          callback(file)
        }
      },
      // 恢复上传,callback是恢复上传后的回调
      resume: (callback) => {
        file.status = uploadStatus.uploading[file.language]

        if (!file.chunkUrls.length) {
          handleUpload(file, sourceFiles, callback)
        }

        if (file.chunkUrls.length) {
          startUploadPromise(file, sourceFiles, callback)
        }

        if (callback) {
          callback()
        }
      },
      // 删除事件,callback是删除完成后的回调
      delete: (callback) => {
        file.status = uploadStatus.deleted[file.language]

        while (file.cancels.length) {
          file.cancels.pop()()
        }

        if (callback) {
          callback()
        }
      }
    }

    file.fileAdded()

    // 获取视频文件相关参数
    if (file.type.indexOf('video') !== -1) {
      handleVideoCover(file, options.getVideoImages)
    }

    inputChange(file, (list, len) => {
      const listLen = list.length
      file.chunkedProgress = listLen <= 0 ? 0 : Math.round((listLen / len) * 10000) / 100.0
    }).then(() => {
      if (file.status === uploadStatus.deleted[file.language]) return

      // 开始上传前,这时候仅仅是添加了源文件
      file.beforeUpload()

      file.status = uploadStatus.toStarted[file.language]

      // 如果允许在添加源文件后自动上传，会进行自动上传
      if (file.autoStart) {
        file.start()
      }
    })
  }
}

const handleUpload = (file, sourceFiles, callback) => {
  getMultipartUpload(file).then(async (res) => {
    file.uploadTime = new Date().getTime()

    if (res.chunkUrls === null) {
      file.uploaded = formatSize(file.fileSizeByte)
      file.uploadedSize = file.fileSizeByte
      file.status = uploadStatus.success[file.language]
      file.percentage = 100.0
      file.remainingTime = '0 秒'
      file.url = res.file.fileUrl

      console.log('file: ', file)

      return file.uploadFinished(
        Object.assign(
          file.file,
          { url: file.url, id: res.file.id, duration: file.duration }
        ))
    }

    const { chunkUrls: { uploadUrls, uploadId } } = res

    file.uploadId = uploadId
    file.chunkUrls = uploadUrls
    file.promises = handleUploadPromise(file)

    // 开始上传，这时候，文件已经分片
    file.startUpload()

    startUploadPromise(file, sourceFiles, callback)
  }).catch(() => {
    file.status = uploadStatus.failed[file.language]
  })
}

const startUploadPromise = (file, sourceFiles, callback) => {
  const uploadPart = partUpload(file)

  promisePool(file.simultaneousUploads, file.promises, uploadPart, (isSuccess) => {
    if (isSuccess) {
      mergeFile(file, sourceFiles)
    }

    if (!isSuccess) {
      if (file.cancels.length) {
        file.status = uploadStatus.failed[file.language]
      }
    }
  })

  if (callback) {
    callback(file)
  }
}

const getMultipartUpload = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      bucketName: 'file',
      filename: file.name,
      totalPart: file.chunks.length,
      md5: file.md5,
      fileType: file.type
    }

    createMultipartUpload(params).then((res) => {
      if (res.success) {
        const result = res.data

        resolve(result)
      }
    }).catch((err) => {
      reject(err)
    })
  })
}

const handleUploadPromise = (file) => {
  const promises = []

  for (let i = 0; i < file.chunkUrls.length; i++) {
    let param = {
      index: i,
      uploadUrl: file.chunkUrls[i],
      file: file.chunks[i].file
    }

    promises.push(param)
  }

  return promises
}

const partUpload = (file) => {
  const uploadPart = (params) => {
    return new Promise((resolve, reject) => {
      upload(params.uploadUrl, params.file, handleCancel(file), (loaded, total) => {
        file.chunks[params.index].uploadProgress = loaded
        file.chunks[params.index].total = total
        countSpeed(file)
        file.uploading(params.index)
      }).then(() => {
        for (let i = file.promises.length - 1; i >= 0; i--) {
          if (file.promises[i].index === params.index) {
            file.promises.splice(i, 1)
          }
        }
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  }

  return uploadPart
}

const mergeFile = async function (file, sourceFiles) {
  files.push(file)

  if (file.uploadId) {
    completeMultipartUpload({
      userId: userId,
      chunkCount: file.chunks.length,
      md5: file.md5,
      uploadId: file.uploadId,
      filename: file.name,
      bucketName: 'file'
    }).then(({ data: { file } }) => {
      file.url = file.fileUrl
      file.status = uploadStatus.success[file.language]

      console.log('文件合并完成!')
    }).catch(() => {
      file.status = uploadStatus.failed[file.language]
    }).finally(() => {
      if (files.length === sourceFiles.length) {
        files = []

        file.uploadFinished(
          Object.assign(
            file.file,
            { url: file.url, id: file.id, duration: file.duration }
          ),
          true
        )
      } else {
        file.uploadFinished(
          Object.assign(
            file.file,
            { url: file.url, id: file.id, duration: file.duration }
          ),
          false
        )
      }
    })
  }
}

const handleCancel = (data) => {
  return new CancelToken((c) => {
    return data.cancels.push(c)
  })
}

const countSpeed = (file) => {
  let uploaded = 0
  file.chunks.forEach(x => {
    uploaded += x.uploadProgress
  })

  // 处理暂定后继续上传或某一分片上传失败重新上传时，进度回滚的问题。
  file.uploadedSize = file.uploadedSize >= uploaded ? file.uploadedSize : uploaded

  const useTime = new Date().getTime() - file.uploadTime
  const speed = file.uploadedSize / (useTime / 1000)

  file.percentage = file.uploadedSize <= 0 ? 0 : Math.round((file.uploadedSize / file.fileSizeByte) * 10000) / 100.0
  file.uploaded = formatSize(file.uploadedSize)
  file.speed = formatSize(speed) + '/s'
  file.remainingTime = formatTime((file.fileSizeByte - file.uploadedSize) / speed)

  // console.log('总大小:', file.fileSize, ' 上传速度:', file.speed, '剩余时间: ', file.remainingTime, ' 上传百分比:', file.percentage, ' 已上传:', file.uploaded)
}

const inputChange = async (file, callback) => {
  if (file) {
    const fileChunkList = createFileChunk(file.file, (data, size) => {
      callback(data, size)
    })

    file.md5 = await getFileChunkMd5(fileChunkList)
    file.chunks = fileChunkList
  }
}

const createFileChunk = (file, callback) => {
  const list = []
  const type = file.type
  let size = 0
  const len = Math.ceil(file.size / CHUNK_SIZE)

  while (size < file.size) {
    const data = {
      file: file.slice(size, size + CHUNK_SIZE),
      type: type,
      uploadProgress: 0,
      total: 0
    }
    list.push(data)
    size += CHUNK_SIZE
    callback(list, len)
  }

  return list
}

const getFileChunkMd5 = (fileChunkList) => {
  return new Promise((resolve) => {
    // 总切片数
    const chunkSize = fileChunkList.length
    // 当前处理位置
    let currentChunk = 0
    // SparkMD5实例的ArrayBuffer
    const spark = new SparkMD5.ArrayBuffer()

    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      try {
        spark.append(e.target.result)
      } catch (error) {
        console.log('获取Md5错误，错误位置：' + currentChunk)
      }
      currentChunk++

      if (currentChunk < chunkSize) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    fileReader.onerror = function () {
      console.warn('Md5：文件读取错误')
    }

    function loadNext () {
      fileReader.readAsArrayBuffer(fileChunkList[currentChunk].file)
    }

    loadNext()
  })
}

const handleVideoCover = async (file, callback) => {
  file.blobUrl = URL.createObjectURL(file.file)
  file.duration = await getVideoDuration(file)

  if (file.cover) {
    const { duration } = await getVideoBasicInfo(file.blobUrl)

    for (let i = 2; i < file.imgNumber + 2; i++) {
      getVideoBase64(file, Math.round(duration / i)).then((image) => {
        file.videoImages.push(image)
      }).finally(() => {
        typeof callback === 'function' && file.videoImages.length === file.imgNumber && callback(file)
      })
    }
  }
}

const getVideoBase64 = (file, targetTime) => {
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')

  video.setAttribute('muted', true)
  video.setAttribute('crossOrigin', 'anonymous')// 处理跨域
  video.setAttribute('src', file.blobUrl)
  video.setAttribute('width', 400)
  video.setAttribute('height', 225)
  canvas.width = video.width
  canvas.height = video.height

  video.currentTime = targetTime // 指定帧数

  return new Promise(function (resolve, reject) {
    video.addEventListener('loadeddata', function () {
      canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height) // 绘制canvas
      // dataURL = canvas.toDataURL('image/jpeg') // 转换为base64
      canvas.toBlob(function (blob) {
        const imagename = `${file.name}_${targetTime}.${blob.type.split('/')[1]}`
        const img = new window.File([blob], imagename, {type: blob.type})

        const image = {
          name: imagename,
          file: img,
          blobUrl: URL.createObjectURL(blob)
        }

        resolve(image)
      })
    })
  })
}

const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    let audioElement = new Audio(file.blobUrl)
    audioElement.addEventListener('loadedmetadata', (_event) => {
      let duration = audioElement.duration
      // 大小 时长
      resolve(duration)
    })
  })
}

const formatSize = (size) => {
  if (size < 1024) {
    return size.toFixed(0) + ' bytes'
  } else if (size < 1024 * 1024) {
    return (size / 1024.0).toFixed(0) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / 1024.0 / 1024.0).toFixed(1) + ' MB'
  } else {
    return (size / 1024.0 / 1024.0 / 1024.0).toFixed(1) + ' GB'
  }
}

const formatTime = (time) => {
  if (time < 60) {
    return time.toFixed(1) + '秒'
  }

  if (time < 60 * 60) {
    return (time / 60).toFixed(1) + '分钟'
  }

  if (time < 60 * 60 * 24) {
    return (time / 60 / 60).toFixed(1) + '小时'
  }

  return (time / 60 / 60 / 24).toFixed(1) + '天'
}

export {
  addFiles
}
