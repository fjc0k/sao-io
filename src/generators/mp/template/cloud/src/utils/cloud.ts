// @ts-ignore
import wxCloud from 'wx-server-sdk'

wxCloud.init()

export const cloud = wxCloud as {
  /**
   * 获取微信调用上下文。
   */
  getWXContext(): {
    /**
     * 小程序用户 openid
     */
    OPENID: string,
    /**
     * 小程序 AppID
     */
    APPID: string,
    /**
     * 小程序用户 unionid
     */
    UNIONID?: string,
  },
}
