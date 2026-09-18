import { Route, Switch } from 'wouter'
import { Landing } from './ui/Landing'
import { Assessment } from './ui/Assessment'
import { Report } from './ui/Report'
import { Science, Privacy, NotFound } from './ui/Pages'
import { Together, Answer } from './ui/Couple'

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/begin" component={Assessment} />
      <Route path="/report" component={Report} />
      {/* Couple mode. Both payloads ride in the URL fragment; no server sees either. */}
      <Route path="/together" component={Together} />
      <Route path="/answer" component={Answer} />
      <Route path="/science" component={Science} />
      <Route path="/privacy" component={Privacy} />
      <Route component={NotFound} />
    </Switch>
  )
}
