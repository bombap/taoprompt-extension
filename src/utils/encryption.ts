import CryptoJS from 'crypto-js'

const SECRET_KEY = 'your-secret-key-111'

export const encrypt = (data: any, isJSON: boolean = true): string => {
  const json = isJSON ? JSON.stringify(data) : data
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString()
}

export const decrypt = (encryptedData: string, isJSON: boolean = true): any => {
  if(!encryptedData) return null
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return isJSON ? JSON.parse(decrypted) : decrypted
}