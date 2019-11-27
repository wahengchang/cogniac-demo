const axios = require("axios")
const baseUrl = 'https://api.cogniac.io/1'

const create = (formData, _options) => {
  const {access_token} = _options
  const headers = {
      'Content-Type': 'multipart/form-data',
      "Authorization": `Bearer ${access_token}`,
  }
  const cogUrl = `${baseUrl}/media`
  return axios.post(cogUrl,formData,{headers})
}

const detections = ({mediaId, captureId}, _options) => {
  const {access_token} = _options
  if(!mediaId || !captureId || !access_token) {
    throw new Error(`[ERROR] missing required para: ${mediaId}, ${captureId}, ${tenantId}`)
  }

  const url = `${baseUrl}/media/${mediaId}/detections`
  const headers = {
    'Content-Type': 'application/json',
    "Authorization": `Bearer ${access_token}`,
  }
  
  return axios.get(
    url,
    {
      params: { wait_capture_id: captureId }, 
      headers
    }
  )
}

const download = (_url = '' ,_options = {}) => {
  const {access_token} = _options
  const url = (_url.includes('http'))? _url : `${baseUrl}/media/${mediaId}/download/${_url}`

  const headers = {
    "Authorization": `Bearer ${access_token}`,
  }
  return axios.get(
    url,
    {
      headers,
      responseType: 'arraybuffer'
    }
  )
}

export default {
  detections,
  create,
  download
}