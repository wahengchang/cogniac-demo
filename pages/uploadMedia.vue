
<template>
  <div class="container">
    <h1>Upload Media Page</h1> <a href='/'>home</a>

    <div class="uploadForm">
      <label>Files
        <!-- <input type="file" id="files" ref="files" multiple v-on:change="handleFilesUpload()"/> -->
        <input type="file" id="files" ref="files" multiple accept="image/*;capture=camera" capture="filesystem" v-on:change="handleFilesUpload()"/>
      </label>
    </div>
    <div class="fileRow">
      <div v-for="(file, key) in files" class="file-listing">
        <span class="fileTitle">{{ file.name }}</span>
        <span class="removeFileButton" v-on:click="removeFile( key )">Remove</span></div>
    </div>
    <br>
    <div class="">
      <button v-on:click="addFiles()" :disabled="isLoading">Add Files</button>
    </div>
    <br>
    <div class="">
      <button v-on:click="submitFiles()" :disabled="isLoading">Submit</button>
    </div>
    <pre class="messageContainer" v-html="message" />

    <div>
     <ImageCogniacMedia v-for="(item, index) in resultDataList" :url='item.url' :boxList='item.boxList' :key='index'/>
     <!-- <ImageCogniacMedia v-if='resultDataList' :url='resultDataList' :boxList='boxList'/> -->
    </div>
  </div>
</template>

<script>
import cogniac from '~/apis/cogniac'
import ImageCogniacMedia from '~/components/ImageCogniacMedia'

export default {
  middleware: 'auth',
  components: {ImageCogniacMedia},
  data(){
    return {
      isLoading: false,
      files: [],
      // urlList: [ "https://api.cogniac.io/1/media/download/J0A0H44ZOL8AJVYWTCKAGKLD0K2T/J0A0H44ZOL8AJVYWTCKAGKLD0K2T" ] ,
      resultDataList: [],
      message: ''
    }
  },
  mounted() {
  },
  methods: {
    addFiles(){
      this.$refs.files.click();
    },
    async submitFiles(){
      this.isLoading = true
      this.message = ''
      await Promise.all(this.files.map(this.uploadSingleFile))
      this.isLoading = true
      return
    },
    /*
      Handles the uploading of files
    */
    handleFilesUpload(){
      let uploadedFiles = this.$refs.files.files;
      /*
        Adds the uploaded file to the files array
      */
      for( var i = 0; i < uploadedFiles.length; i++ ){
        this.files.push( uploadedFiles[i] );
      }
    },
    /*
      Removes a select file the user has uploaded
    */
    removeFile( key ){
      this.files.splice( key, 1 );
    },
    appendMessage(str) {
      console.log(str)
      this.message += `${str}<br />`
    },
    async uploadSingleFile(file) {
     try{
      const {c} = this.$store.state
      const access_token = c
      const subjectId = process.env.COG_SUBJECT_ID
      const formData = new FormData();

      formData.append('files[0]', file);
      this.appendMessage('[INFO] going to upload!!');
      const resMedia = await cogniac.media.create(formData, {access_token})

      this.appendMessage('[INFO] upload success!!');
      const {media_id: mediaId} = resMedia.data
      this.appendMessage(`[INFO] uploaded media: ${mediaId}`)

      // 2- associated
      if(!mediaId) throw new Error('[ERROR] ', mediaId)
      const resAsso = await cogniac.subject.associateMedia({mediaId, subjectId},{access_token})
      const {capture_id: captureId} = resAsso.data
      this.appendMessage(`[INFO] associated media: ${captureId}`)

      // 3- detections
      this.appendMessage('[INFO] detecting')
      const resDetection = await cogniac.media.detections({mediaId, captureId},{access_token})
      // this.appendMessage(`[INFO] detected: ${JSON.stringify(resDetection.data.detections)}`)
      this.appendMessage(`[INFO] detected:`)

      const sortedDetection = resDetection.data.detections.sort((pre, pos) => {
        if(!pos.probability || !pos.app_data) return false
        if(!pre.probability|| !pos.app_data) return true
        return pos.probability - pre.probability
      })
      
      const boxList = sortedDetection[sortedDetection.length -1].app_data
      const url = resMedia.data.media_url
      this.appendMessage('sortedDetection[sortedDetection.length -1]: ', sortedDetection[sortedDetection.length -1])
      this.resultDataList.push({url, boxList})
     }
     catch(e){
       console.error(e)
      console.log('FAILURE!!');
     }
    }
  }
}
</script>

<style>
  .fileRow{
    border: 1px gray solid;
    padding: 5px;
    display: flex;
    flex-direction: column;
  }
  .uploadForm{
    display: none;
  }
  div.file-listing{
    width: 200px;
  }
  span.removeFileButton{
    color: red;
    cursor: pointer;
    float: right;
  }
  span.fileTitle {

  }
</style>
