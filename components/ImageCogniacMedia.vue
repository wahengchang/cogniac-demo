
<template>
  <div class="imgCogniacContainer">
      <div id='blobURL'></div>
      <div id='download'></div>
    <p class='title'>image cogniacmedia</p>
    <p class='subtitle' v-if='!status'>STATUS: no status</p>
    <p class='subtitle' v-if='status === "DOWNLOADING"'>STATUS: DOWNLOADING: {{url}}</p>
    <p class='subtitle' v-if='status === "FINISHED"'>STATUS: FINISHED: {{url}}</p>
    <!-- <a  v-if='blobUrl' :href='blobUrl'> -->
      <canvas ref="canvasContainer" style="border:1px solid #d3d3d3;" />
    <!-- </a> -->
  </div>
</template>

<script>
import cogniac from '~/apis/cogniac'
const offset = 10

export default {
  props: {
    url: String,
    boxList: Array
  },
  async mounted() {
    this.status = 'DOWNLOADING'
    const {c} = this.$store.state
    const access_token = c
    const subjectId = process.env.COG_SUBJECT_ID

    const {url, boxList = []} = this
    console.log(`[INFO] downloading image: ${url}`)
    const resImageBase64 = await cogniac.media.download(url, {access_token})

    // console.log(resImageBase64.data.length)
    console.log(`[INFO] finished download`)

    const blob = new Blob([resImageBase64.data], {type: 'application/octet-stream'})
    this.status = 'FINISHED'
    this.blobUrl = URL.createObjectURL(blob)

    this.initCanvas(this.blobUrl, boxList, this)
  },
  methods: {
    initCanvas: (url, boxList, self) => {
      const {initBoxList} = self
      const canvas = self.$refs.canvasContainer
      const ctx = canvas.getContext('2d');
      const image = new Image();

      image.onload = () => {
        const screenW = innerWidth
        // const screenH = window.outerHeight
        const imageW = image.width
        const imageH = image.height
        const scale = ((screenW / imageW) < 1) ? (screenW / imageW) : 0.8

        console.log('scale: ', scale)

        ctx.imageSmoothingEnabled = false;
        canvas.width = imageW * scale
        canvas.height = imageH * scale  
        ctx.drawImage(image, 0, 0,canvas.width,canvas.height);

        initBoxList(ctx, boxList, {scale})
      };
      image.src = url
    },
    initBoxList: (ctx, boxList, {scale = 1}) => {
      boxList.forEach((item, index) => {        
        const {box, probability} = item
        const {x0,y0,x1,y1} = box

        // drawing box 
        ctx.beginPath()
        ctx.lineWidth = "3"
        ctx.strokeStyle = "green"
        ctx.rect(
          x0 * scale,
          y0 * scale,
          (x1-x0)*scale,
          (y1-y0)*scale
        )
        ctx.stroke()

        // drawing text
        ctx.font = "30px";
        ctx.fillStyle = "#9edd9d";
        ctx.fillText(
          probability,
          x0 * scale + offset,
          y1 * scale - offset
        );
      });
    }
  },
  data: function () {
      return {
          status: null,
          blobUrl: null
      }
  }
};
</script>

<style scoped>
.imgCogniacContainer {
    border: gray 1px solid;
    margin: 5px 0;
}
.title {
    font-size: 16px;
    font-weight: 900;
}
.subtitle {
    font-size: 14px;
}
#tempImage {
  display: none;
}
</style>