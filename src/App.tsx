import { Route, Switch } from 'wouter'
import { Landing } from './ui/Landing'
import { Assessment } from './ui/Assessment'
import { Report } from './ui/Report'
import { Science, Privacy, NotFound } from './ui/Pages'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/begin" component={Assessment} />
      <Route path="/report" component={Report} />
      <Route path="/science" component={Science} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  )
}
