<template>
  <section class="avatar-uploader">
    <input id="file" type="file" @change="upload" :multiple="multiple" :accept="acceptType ? `${acceptType}/*`:'MIME_type'" />
    <div class="upload" :class="{ border: !form.localFiles.length }" for="file" @click="handleUpload" v-for="(item, index) in form.localFiles" :key="index">
      <img v-if="item" :src="item" class="avatar" />
      <i v-if="editable" class="del-icon el-icon-remove" @click.prevent.stop="delFile(index)"></i>
      <slot></slot>
    </div>
    <i v-if="multiple || !form.localFiles.length" @click="handleUpload" class="el-icon-plus avatar-uploader-icon"></i>
  </section>
</template>

<script>
export default {
  name: 'UploadFile',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    },
    acceptType: {
      type: String,
      default: ''
    },
    multiple: Boolean
  },
  data () {
    return {
      form: {
        files: [],
        localFiles: [],
        avatarUrl: ''
      }
    }
  },
  watch: {
    images: {
      handler (newValue) {
        this.form.localFiles = newValue
      },
      immediate: true
    }
  },
  methods: {
    handleUpload () {
      document.querySelector('#file').click()
    },
    upload () {
      this.form.files = Array.from(document.querySelector('#file').files)

      for (let i in this.form.files) {
        this.fileReader(this.form.files[i]).then(base64 => {
          this.form.localFiles.push(base64)
        })
      }

      this.$emit('change', this.form.files)
    },
    delFile (index) {
      // 清除原生file的值，否则再选文件不会触发change事件
      document.querySelector('#file').value = ''

      this.form.files.splice(index, 1)
      this.form.localFiles.splice(index, 1)

      this.$emit('deleteFile', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-uploader {
  display: flex;
  flex-wrap: wrap;
  width: 148px;
  height: 148px;
  cursor: pointer;
  position: relative;
}
#file {
  display: none;
}
.border {
  border: 1px dashed #8c939d;
  border-radius: 6px;
}
.upload {
  display: block;
  width: 148px;
  height: 148px;
  position: relative;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  border: 1px dashed #8c939d;
  border-radius: 6px;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  position: absolute;
}
.del-icon {
  font-size: 24px;
  position: absolute;
  top: -10px;
  right: -10px;
  color: rgba(0 ,0, 0, 0.6);
  z-index: 2;
  cursor: pointer;
}
</style>
