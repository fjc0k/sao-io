import './app.scss'
import '@tarojs/async-await'
import Taro from '@tarojs/taro'
<% if (enableCloud) { %>
Taro.cloud.init()
<% } -%>

class App extends Taro.Component {
  config: Taro.Config = {
    pages: [
      // @index('./pages/**/*.tsx', (pp, cc) => `'${pp.path.replace('./', '')}',`)
      'pages/Home/Index',
      // @endindex
    ],
    window: {
      navigationBarTitleText: '',
      navigationBarTextStyle: 'black',
      navigationBarBackgroundColor: '#FFFFFF',
      backgroundColor: '#E8E8E8',
    },
  }

  render(): any {
    return null
  }
}

Taro.render(<App />, document.getElementById('app'))
