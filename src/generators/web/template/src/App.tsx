import './App.scss'
import './enhance'
// @ts-ignore
import CacheRoute from 'react-router-cache-route'
import React from 'react'
import ReactDOM from 'react-dom'
import { pageNames, pages, pageUrls } from './pages'
import { HashRouter as Router, withRouter } from 'react-router-dom'

const ScrollToTop = withRouter(
  (class extends React.Component {
    componentDidUpdate(prevProps: any) {
      if ((this.props as any).location.pathname !== prevProps.location.pathname) {
        window.scrollTo(0, 0)
      }
    }

    render() {
      return this.props.children
    }
  }) as any,
)

function App() {
  return (
    <Router>
      <ScrollToTop>
        {pageNames.map(pageName => {
          return (
            <CacheRoute
              key={pageName}
              exact={true}
              path={pageUrls[pageName]}
              component={pages[pageName]}
              when='always'
            />
          )})}
      </ScrollToTop>
    </Router>
  )
}

ReactDOM.render(
  <App />,
  document.getElementById('app'),
)
