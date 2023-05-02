<template>
    <div id="tinymce-editor"></div>
</template>
<script>
import tinymce from '~/static/tinymce/tinymce.min'
import '~/static/tinymce/themes/silver/theme.min'
import '~/static/tinymce/langs/zh_CN'
import '~/static/tinymce/icons/default/icons.min'

// 引入插件
import '~/static/tinymce/plugins/fullscreen/plugin.min'
import '~/static/tinymce/plugins/link/plugin.min'
import '~/static/tinymce/plugins/code/plugin.min'
import '~/static/tinymce/plugins/image/plugin.min' // 图片上传需要
import '~/static/tinymce/plugins/imagetools/plugin.min' // 图片编辑工具
import '~/static/tinymce/plugins/paste/plugin.min' // 图片粘贴自动上传需要
import '~/static/tinymce/plugins/media/plugin.min'
import '~/static/tinymce/plugins/importword/plugin.min' // 导入word文件
import '~/static/tinymce/plugins/table/plugin.min'
import '~/static/tinymce/plugins/lists/plugin.min'
import '~/static/tinymce/plugins/colorpicker/plugin.min'
import '~/static/tinymce/plugins/contextmenu/plugin.min'
import '~/static/tinymce/plugins/wordcount/plugin.min'
import '~/static/tinymce/plugins/textcolor/plugin.min'
import '~/static/tinymce/plugins/emoticons/plugin.min'

import { addFiles } from '@/utils/upload'

const TINYMCE_DIR = '../../../static/tinymce'

export default {
  name: 'EditorTinymce',
  props: {
    value: {
      type: String,
      default: ''
    },
    plugins: {
      type: [String, Array],
      default: 'link lists image imagetools importword media code table textcolor wordcount contextmenu paste colorpicker emoticons fullscreen'
    },
    toolbar: {
      type: [String, Array],
      default: 'undo redo | fullscreen | importword | fontsizeselect | fontselect | emoticons bold italic underline strikethrough | formatselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image imagetools_toolbar media table | removeformat | forecolor backcolor | blockquote | link unlink code'
    }
  },
  data () {
    this.selector = '#tinymce-editor'
    return {
      form: {
        files: []
      }
    }
  },
  mounted () {
    tinymce.init({
      selector: this.selector,
      language: 'zh_CN',
      height: '95%',
      skin_url: `${TINYMCE_DIR}/skins/ui/oxide/`,
      emoticons_database_url: `${TINYMCE_DIR}/plugins/emoticons/js/emojis.js`,
      content_css: `${TINYMCE_DIR}/skins/content/default/content.min.css`,
      plugins: this.plugins,
      toolbar: this.toolbar,
      branding: false,
      menubar: false,
      file_picker_types: 'image media',

      // CONFIG: ContentStyle 这块很重要， 在最后呈现的页面也要写入这个基本样式保证前后一致， `table`和`img`的问题基本就靠这个来填坑了
      content_style: `
        *                         { padding:0; margin:0; }
        html, body                { height:100%; }
        img                       { max-width:100%; display:block;height:auto; }
        a                         { text-decoration: none; }
        iframe                    { width: 100%; }
        p                         { line-height:1.6; margin: 0px; }
        table                     { word-wrap:break-word; word-break:break-all; max-width:100%; border:none; border-color:#999; }
        .mce-object-iframe        { width:100%; box-sizing:border-box; margin:0; padding:0; }
        ul,ol                     { list-style-position:inside; }
      `,

      // CONFIG: Paste
      paste_retain_style_properties: 'all',
      paste_word_valid_elements: '*[*]', // word需要它
      paste_data_images: true, // 粘贴的同时能把内容里的图片自动上传，非常强力的功能
      paste_convert_word_fake_lists: false, // 插入word文档需要该属性
      paste_webkit_styles: 'all',
      paste_merge_formats: true,
      nonbreaking_force_tab: false,
      paste_auto_cleanup_on_paste: false,

      // CONFIG: Font
      fontsize_formats: '10px 11px 12px 14px 16px 18px 20px 24px',

      // CONFIG: StyleSelect
      style_formats: [
        {
          title: '首行缩进',
          block: 'p',
          styles: { 'text-indent': '2em' }
        },
        {
          title: '行高',
          items: [
            {title: '1', styles: { 'line-height': '1' }, inline: 'span'},
            {title: '1.5', styles: { 'line-height': '1.5' }, inline: 'span'},
            {title: '2', styles: { 'line-height': '2' }, inline: 'span'},
            {title: '2.5', styles: { 'line-height': '2.5' }, inline: 'span'},
            {title: '3', styles: { 'line-height': '3' }, inline: 'span'}
          ]
        }
      ],

      // FontSelect
      font_formats: `
        微软雅黑=微软雅黑;
        宋体=宋体;
        黑体=黑体;
        仿宋=仿宋;
        楷体=楷体;
        隶书=隶书;
        幼圆=幼圆;
        Andale Mono=andale mono,times;
        Arial=arial, helvetica,
        sans-serif;
        Arial Black=arial black, avant garde;
        Book Antiqua=book antiqua,palatino;
        Comic Sans MS=comic sans ms,sans-serif;
        Courier New=courier new,courier;
        Georgia=georgia,palatino;
        Helvetica=helvetica;
        Impact=impact,chicago;
        Symbol=symbol;
        Tahoma=tahoma,arial,helvetica,sans-serif;
        Terminal=terminal,monaco;
        Times New Roman=times new roman,times;
        Trebuchet MS=trebuchet ms,geneva;
        Verdana=verdana,geneva;
        Webdings=webdings;
        Wingdings=wingdings,zapf dingbats`,

      // 监听tinymce初始化完成事件
      setup: (editor) => {
        editor.on('init', (e) => {
          editor.setContent(this.value)
        })
      },
      // 监听input与change事件，实时更新value
      init_instance_callback: (editor) => {
        editor.on('input', (e) => {
          this.$emit('input', e.target.innerHTML)
        })
        editor.on('change', (e) => {
          this.$emit('input', e.level.content)
        })
      },

      // 图片上传回调函数
      images_upload_handler: (blobInfo, success, failure) => {
        this.form.files.push(blobInfo.blob())
        this.uploadFile().then(({ fileUrls }) => {
          let img = fileUrls[0]
          success(img)
        }).catch(() => {
          failure('上传失败')
        })
      },
      // 文件上传，这里用来处理媒体类型的资源上传
      file_picker_callback: (callback, value, meta) => {
        if (meta.filetype === 'media') {
          var input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'video/mp4')

          // 因为input的onchange事件需要通过this获取选中的文件
          let _this = this

          input.onchange = function (e) {
            let file = this.files[0]
            let ext = file.name.split('.')[1]
            if (
              ext !== 'mp4' &&
                  ext !== 'AVI' &&
                  ext !== 'mov' &&
                  ext !== 'FLV' &&
                  ext !== 'rmvb'
            ) {
              return _this.toastInfo('上传资源只能是 AVI/mov/rmvb/xlsx/FLV/mp4 格式的视频!', 'error')
            }

            addFiles(this.files, null, null, null, null, null, (file) => {
              callback(file.url)
            })
          }
          input.click()
        }
      },
      media_url_resolver: (data, resolve) => {
        try {
          let videoUri = encodeURI(data.url)
          let embedHtml = `<p>
                  <span
                    class="mce-object mce-object-video"
                    data-mce-selected="1"
                    data-mce-object="video"
                    data-mce-p-width="100%"
                    data-mce-p-height="auto"
                    data-mce-p-controls="controls"
                    data-mce-p-controlslist="nodownload"
                    data-mce-p-allowfullscreen="true"
                    data-mce-p-src=${videoUri} >
                    <video src=${data.url} width="100%" height="auto" controls="controls" controlslist="nodownload">
                    </video>
                  </span>
                </p>
                <p style="text-align: left;"></p>`
          resolve({ html: embedHtml })
        } catch (e) {
          resolve({ html: '' })
        }
      }
    })
  },
  beforeDestroy () {
    // 必须在组件销毁前销毁tinymce
    // 不然再挂载组件无法init tinymce
    this.$emit('on-destroy')
    tinymce.remove(this.selector)
  }
}
</script>
<style scoped>
    @import url("../../../static/tinymce/skins/ui/oxide/skin.min.css");
</style>
